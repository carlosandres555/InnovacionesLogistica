import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Get or create delivery statuses
  const exitosa = await prisma.deliveryStatus.findUnique({
    where: { nombre: 'EXITOSA' },
  })

  const parcial = await prisma.deliveryStatus.findUnique({
    where: { nombre: 'PARCIAL' },
  })

  const noExitosa = await prisma.deliveryStatus.findUnique({
    where: { nombre: 'NO EXITOSA' },
  })

  if (!exitosa) {
    await prisma.deliveryStatus.create({
      data: {
        nombre: 'EXITOSA',
        descripcion: 'Entrega completada exitosamente',
        color: 'green',
      },
    })
    console.log('✅ Estado EXITOSA creado')
  }

  if (!parcial) {
    await prisma.deliveryStatus.create({
      data: {
        nombre: 'PARCIAL',
        descripcion: 'Entrega parcial',
        color: 'orange',
      },
    })
    console.log('✅ Estado PARCIAL creado')
  }

  if (!noExitosa) {
    await prisma.deliveryStatus.create({
      data: {
        nombre: 'NO EXITOSA',
        descripcion: 'Entrega no realizada',
        color: 'red',
      },
    })
    console.log('✅ Estado NO EXITOSA creado')
  }

  // Get statuses again (in case they were just created)
  const statuses = await prisma.deliveryStatus.findMany()

  // Add reasons for each status
  const parcialsStatus = statuses.find(s => s.nombre === 'PARCIAL')
  if (parcialsStatus) {
    const reasonsData = [
      { nombre: 'Producto dañado', descripcion: 'El producto llegó en mal estado' },
      { nombre: 'Cantidad incompleta', descripcion: 'Faltaron unidades del pedido' },
      { nombre: 'Producto vencido', descripcion: 'El producto venía vencido o próximo a vencer' },
      { nombre: 'Cliente no disponible', descripcion: 'El cliente no estaba disponible pero se dejó parte del pedido' },
      { nombre: 'Pedido incorrecto', descripcion: 'Se entregó parcialmente por error en el pedido' },
    ]

    for (const reasonData of reasonsData) {
      const existing = await prisma.deliveryStatusReason.findFirst({
        where: {
          statusId: parcialsStatus.id,
          nombre: reasonData.nombre,
        },
      })

      if (!existing) {
        await prisma.deliveryStatusReason.create({
          data: {
            statusId: parcialsStatus.id,
            ...reasonData,
          },
        })
        console.log(`  → Motivo "${reasonData.nombre}" agregado a PARCIAL`)
      }
    }
  }

  const noExitosaStatus = statuses.find(s => s.nombre === 'NO EXITOSA')
  if (noExitosaStatus) {
    const reasonsData = [
      { nombre: 'Dirección incorrecta', descripcion: 'No se pudo ubicar la dirección' },
      { nombre: 'Cliente rechazó pedido', descripcion: 'El cliente se negó a recibir el pedido' },
      { nombre: 'Cliente no disponible', descripcion: 'No se encontró al cliente después de varios intentos' },
      { nombre: 'Cambio de domicilio', descripcion: 'El cliente cambió de domicilio' },
      { nombre: 'Situación de seguridad', descripcion: 'No se pudo entregar por razones de seguridad' },
      { nombre: 'Falta de inventario', descripcion: 'No había inventario disponible' },
      { nombre: 'Otra razón', descripcion: 'Otra razón no especificada' },
    ]

    for (const reasonData of reasonsData) {
      const existing = await prisma.deliveryStatusReason.findFirst({
        where: {
          statusId: noExitosaStatus.id,
          nombre: reasonData.nombre,
        },
      })

      if (!existing) {
        await prisma.deliveryStatusReason.create({
          data: {
            statusId: noExitosaStatus.id,
            ...reasonData,
          },
        })
        console.log(`  → Motivo "${reasonData.nombre}" agregado a NO EXITOSA`)
      }
    }
  }

  console.log('✅ Seed completado')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
