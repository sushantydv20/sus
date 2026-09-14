const { initialize, query, queryOne } = require('./db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('Initializing PostgreSQL database...');
    await initialize();
    
    // Check if tables have data
    const settingsCount = await queryOne('SELECT COUNT(*) as count FROM settings');
    
    if (settingsCount && settingsCount.count === 0) {
      console.log('Populating default settings...');
      
      const DEFAULT = {
        name: "SUSHANT YADAV",
        phone: "+9779820221555",
        wa: "9779820221555",
        email: "",
        bio: "Premium websites, modern interfaces and digital experiences built with clean code, strong visual design and strategic thinking."
      };
      
      for (const [key, value] of Object.entries(DEFAULT)) {
        await query(
          'INSERT INTO settings(key, value) VALUES($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2',
          [key, JSON.stringify(value)]
        );
      }
      
      console.log('Default settings inserted');
    }
    
    // Check if pricing has data
    const pricingCount = await queryOne('SELECT COUNT(*) as count FROM pricing');
    
    if (pricingCount && pricingCount.count === 0) {
      console.log('Populating default pricing...');
      
      const pricing = [
        ['starter', 'Starter', '₹4,999', 'starting', '1–3 page responsive website'],
        ['standard', 'Standard', '₹9,999', 'from', '5–10 pages with CMS and analytics'],
        ['premium', 'Premium', '₹19,999', 'from', '15+ pages, advanced features, e-commerce'],
        ['enterprise', 'Enterprise', 'Custom', 'starting at', 'Complete digital ecosystem']
      ];
      
      for (const [pkg_key, pkg_name, price, suffix, desc] of pricing) {
        await query(
          'INSERT INTO pricing(package_key, package_name, price_text, suffix, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT(package_key) DO NOTHING',
          [pkg_key, pkg_name, price, suffix, desc]
        );
      }
      
      console.log('Default pricing inserted');
    }
    
    // Initialize admin password if not exists
    const adminCheck = await queryOne('SELECT value FROM admin WHERE key = $1', ['password']);
    if (!adminCheck) {
      console.log('Initializing admin password...');
      const crypto = require('crypto');
      const defaultPass = process.env.ADMIN_PASS || 'admin@' + crypto.randomBytes(8).toString('hex');
      
      function hashPassword(p, salt = crypto.randomBytes(16).toString('hex')) {
        return salt + ':' + crypto.scryptSync(p, salt, 64).toString('hex');
      }
      
      await query(
        'INSERT INTO admin(key, value) VALUES($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2',
        ['password', hashPassword(defaultPass)]
      );
      
      console.log('Admin password initialized');
    }
    
    console.log('✓ Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
