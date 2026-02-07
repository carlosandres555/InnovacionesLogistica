import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import AWS from 'aws-sdk'

const router = express.Router()
const prisma = new PrismaClient()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const GeneratePresignedUrlSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  shipmentId: z.string().optional(),
  companyId: z.string().optional()
})

// Generate presigned URL for uploads
router.post('/presigned-url', async (req, res, next) => {
  try {
    const { fileName, fileType, shipmentId, companyId } = GeneratePresignedUrlSchema.parse(req.body)

    const key = `uploads/${Date.now()}-${fileName}`

    const params = {
      Bucket: process.env.AWS_S3_UPLOADS_BUCKET || 'innovaciones-logistica-uploads',
      Key: key,
      ContentType: fileType,
      Expires: 900 // 15 minutes
    }

    const presignedUrl = s3.getSignedUrl('putObject', params)

    // Record in database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName,
        fileUrl: `https://${params.Bucket}.s3.amazonaws.com/${key}`,
        fileSize: 0,
        fileType,
        shipmentId: shipmentId || null,
        companyId: companyId || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    res.json({
      presignedUrl,
      fileId: fileUpload.id,
      expiresIn: 900
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      })
    }
    next(error)
  }
})

// Get file upload by ID
router.get('/:id', async (req, res, next) => {
  try {
    const file = await prisma.fileUpload.findUnique({
      where: { id: req.params.id }
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json(file)
  } catch (error) {
    next(error)
  }
})

// Delete file upload
router.delete('/:id', async (req, res, next) => {
  try {
    const file = await prisma.fileUpload.findUnique({
      where: { id: req.params.id }
    })

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Delete from S3
    const key = file.fileUrl.split('.amazonaws.com/')[1]
    if (key) {
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_UPLOADS_BUCKET || 'innovaciones-logistica-uploads',
        Key: key
      }).promise()
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'File deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
