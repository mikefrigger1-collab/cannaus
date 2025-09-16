// check-tables.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

async function checkTables() {
  console.log('🔍 Checking what tables exist in your database...')
  
  const dbPath = path.join(__dirname, 'prisma', 'dev.db')
  console.log(`📁 Database file: ${dbPath}`)
  
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message)
      return
    }
    console.log('✅ Connected to database')
  })

  // Check what tables exist
  const tables = await new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })

  console.log('\n📊 Tables found in database:')
  if (tables.length === 0) {
    console.log('   ❌ No tables found! Database might be empty.')
  } else {
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`)
    })
  }

  // If no 'articles' table, check for similar names
  const articleTable = tables.find(t => t.name.toLowerCase().includes('article'))
  if (articleTable && articleTable.name !== 'articles') {
    console.log(`\n💡 Found table with similar name: "${articleTable.name}"`)
    
    // Show the structure of this table
    const tableInfo = await new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${articleTable.name})`, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
    
    console.log(`\n📋 Structure of "${articleTable.name}" table:`)
    tableInfo.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`)
    })
  }

  // Check for any data in the first table
  if (tables.length > 0) {
    const firstTable = tables[0].name
    const count = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM "${firstTable}"`, [], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row.count)
        }
      })
    })
    
    console.log(`\n📈 Records in "${firstTable}": ${count}`)
  }

  db.close()
}

checkTables().catch(console.error)