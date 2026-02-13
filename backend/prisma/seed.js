import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Get or create roles with permissions
  const rolesData = [
    {
      role: 'ADMIN',
      modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'],
      description: 'Acceso a todas las funcionalidades'
    },
    {
      role: 'ANALISTA',
      modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'],
      description: 'Gestión de tráfico e histórico'
    },
    {
      role: 'IN_HOUSE',
      modules: ['trafico'],
      description: 'Visualización de tráfico solamente'
    },
    {
      role: 'CUSTOMER',
      modules: ['dashboard'],
      description: 'Acceso básico'
    }
  ]

  for (const roleData of rolesData) {
    const existing = await prisma.rolePermission.findUnique({
      where: { role: roleData.role }
    })

    if (!existing) {
      await prisma.rolePermission.create({
        data: roleData
      })
      console.log(`✅ Rol ${roleData.role} creado con módulos: ${roleData.modules.join(', ')}`)
    }
  }

  // Get or create contractors (companies)
  const contractorsData = [
    { name: 'ELC', email: 'elc@contractors.com', description: 'Contratista ELC' },
    { name: 'BAJO CERO', email: 'bajocero@contractors.com', description: 'Contratista Bajo Cero' },
    { name: 'LIS', email: 'lis@contractors.com', description: 'Contratista LIS' },
    { name: 'TRASCENDO', email: 'trascendo@contractors.com', description: 'Contratista Trascendo' },
    { name: 'CORDIANDINA', email: 'cordiandina@contractors.com', description: 'Contratista Cordiandina' }
  ]

  const contractors = {}
  for (const contractorData of contractorsData) {
    let contractor = await prisma.company.findFirst({
      where: { name: contractorData.name }
    })

    if (!contractor) {
      // Crear un usuario dummy como owner
      const ownerEmail = `owner-${contractorData.name.toLowerCase().replace(/\s+/g, '-')}@contractors.com`
      let owner = await prisma.user.findUnique({
        where: { email: ownerEmail }
      })

      if (!owner) {
        owner = await prisma.user.create({
          data: {
            email: ownerEmail,
            password: 'dummy',
            firstName: contractorData.name,
            lastName: 'Owner',
            role: 'ADMIN'
          }
        })
      }

      contractor = await prisma.company.create({
        data: {
          ...contractorData,
          email: contractorData.email,
          ownerId: owner.id
        }
      })
      console.log(`✅ Contratista ${contractorData.name} creado`)
    }
    contractors[contractorData.name] = contractor.id
  }

  // Datos de placas y sus contratistas
  const vehiclesData = [
    { plate: 'GFP802', contractor: 'ELC' },
    { plate: 'WPV713', contractor: 'ELC' },
    { plate: 'TJT587', contractor: 'ELC' },
    { plate: 'GFP788', contractor: 'ELC' },
    { plate: 'GFP900', contractor: 'ELC' },
    { plate: 'LGV010', contractor: 'BAJO CERO' },
    { plate: 'NYP101', contractor: 'BAJO CERO' },
    { plate: 'LZR573', contractor: 'BAJO CERO' },
    { plate: 'NYP520', contractor: 'BAJO CERO' },
    { plate: 'SZM576', contractor: 'BAJO CERO' },
    { plate: 'PWK807', contractor: 'BAJO CERO' },
    { plate: 'NGY639', contractor: 'LIS' },
    { plate: 'WOT146', contractor: 'LIS' },
    { plate: 'SZM775', contractor: 'LIS' },
    { plate: 'SZL461', contractor: 'LIS' },
    { plate: 'STR672', contractor: 'LIS' },
    { plate: 'WEO578', contractor: 'LIS' },
    { plate: 'WEO748', contractor: 'LIS' },
    { plate: 'UFZ340', contractor: 'TRASCENDO' },
    { plate: 'GFQ001', contractor: 'TRASCENDO' },
    { plate: 'GFQ364', contractor: 'TRASCENDO' },
    { plate: 'KMZ194', contractor: 'TRASCENDO' },
    { plate: 'TAM471', contractor: 'TRASCENDO' },
    { plate: 'SZM441', contractor: 'LIS' },
    { plate: 'SZW944', contractor: 'LIS' },
    { plate: 'LZR961', contractor: 'LIS' },
    { plate: 'STR751', contractor: 'LIS' },
    { plate: 'TZM693', contractor: 'LIS' },
    { plate: 'WGW054', contractor: 'LIS' },
    { plate: 'SUF519', contractor: 'LIS' },
    { plate: 'TTS343', contractor: 'TRASCENDO' },
    { plate: 'WGU592', contractor: 'LIS' },
    { plate: 'GET029', contractor: 'CORDIANDINA' },
    { plate: 'WOM235', contractor: 'LIS' },
    { plate: 'SZM655', contractor: 'CORDIANDINA' },
    { plate: 'SZL758', contractor: 'TRASCENDO' },
    { plate: 'SXC562', contractor: 'TRASCENDO' },
    { plate: 'LZR673', contractor: 'LIS' },
    { plate: 'WGV667', contractor: 'CORDIANDINA' },
    { plate: 'WGU544', contractor: 'TRASCENDO' },
    { plate: 'THK793', contractor: 'LIS' },
    { plate: 'WGV448', contractor: 'TRASCENDO' },
    { plate: 'GES757', contractor: 'CORDIANDINA' },
    { plate: 'SNX730', contractor: 'CORDIANDINA' },
    { plate: 'WEL945', contractor: 'TRASCENDO' },
    { plate: 'WGB996', contractor: 'TRASCENDO' },
    { plate: 'WGU593', contractor: 'LIS' },
    { plate: 'SZM090', contractor: 'TRASCENDO' },
    { plate: 'SNS243', contractor: 'TRASCENDO' },
    { plate: 'GFQ193', contractor: 'LIS' },
    { plate: 'TRO021', contractor: 'TRASCENDO' },
    { plate: 'TTS089', contractor: 'LIS' },
    { plate: 'TDV793', contractor: 'TRASCENDO' },
    { plate: 'WGV016', contractor: 'LIS' },
    { plate: 'TAL700', contractor: 'TRASCENDO' }
  ]

  let vehiclesCreated = 0
  for (const vehicleData of vehiclesData) {
    const existing = await prisma.vehicle.findUnique({
      where: { plate: vehicleData.plate }
    })

    if (!existing) {
      await prisma.vehicle.create({
        data: {
          plate: vehicleData.plate,
          model: 'Not specified',
          capacity: 0,
          companyId: contractors[vehicleData.contractor],
          status: 'ACTIVE'
        }
      })
      vehiclesCreated++
    }
  }
  console.log(`✅ ${vehiclesCreated} vehículos creados`)

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
