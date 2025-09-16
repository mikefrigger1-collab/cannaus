// fix-datatables-only.js
const { PrismaClient } = require('@prisma/client')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const newPrisma = new PrismaClient()

async function fixDataTablesOnly() {
  console.log('🔧 Fixing DataTables migration (removing updatedAt field)...')
  
  try {
    const dbPath = path.join(__dirname, 'prisma', 'dev.db')
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

    // Get data tables from SQLite
    const dataTables = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM DataTable", [], (err, rows) => {
        if (err) {
          console.log('⚠️  No DataTable found:', err.message)
          resolve([])
        } else {
          resolve(rows)
        }
      })
    })

    console.log(`📊 Found ${dataTables.length} DataTables to migrate`)

    db.close()

    let migratedDataTables = 0
    
    for (const dataTable of dataTables) {
      try {
        await newPrisma.dataTable.create({
          data: {
            title: dataTable.title,
            tableData: dataTable.tableData,
            slug: dataTable.slug,
            createdAt: new Date(dataTable.createdAt)
            // Note: NO updatedAt field - the PostgreSQL schema doesn't have it
          }
        })
        migratedDataTables++
        console.log(`   ✅ DataTable: ${dataTable.title}`)
      } catch (error) {
        console.log(`   ❌ Error migrating DataTable "${dataTable.title}":`, error.message)
        // If it's a duplicate, that's okay
        if (error.message.includes('Unique constraint')) {
          console.log(`       (Already exists - skipping)`)
          migratedDataTables++ // Count it as migrated since it exists
        }
      }
    }

    console.log('\n🎉 DATATABLES MIGRATION COMPLETE!')
    
    const finalDataTableCount = await newPrisma.dataTable.count()
    
    console.log(`📊 RESULTS:`)
    console.log(`   📊 DataTables: ${dataTables.length} found → ${migratedDataTables} migrated`)
    console.log(`   ✅ Total data tables in database: ${finalDataTableCount}`)

  } catch (error) {
    console.error('❌ DataTables migration failed:', error)
  } finally {
    await newPrisma.$disconnect()
  }
}

fixDataTablesOnly()