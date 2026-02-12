import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Agregando estados de entrega...')

  const statuses = [
    {
      nombre: 'EXITOSA',
      descripcion: 'Entrega completada exitosamente',
      color: 'green',
    },
    {
      nombre: 'PARCIAL',
      descripcion: 'Entrega parcial, no se completó la cantidad total',
      color: 'orange',
    },
    {
      nombre: 'NO EXITOSA',
      descripcion: 'Entrega no realizada',
      color: 'red',
    },
  ]

  for (const status of statuses) {
    const existing = await prisma.deliveryStatus.findUnique({
      where: { nombre: status.nombre },
    })

    if (!existing) {
      const created = await prisma.deliveryStatus.create({
        data: status,
      })
      console.log(`✅ Estado creado: ${created.nombre}`)
    } else {
      console.log(`⏭️  Estado ya existe: ${status.nombre}`)
    }
  }

  console.log('✅ Completado!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
