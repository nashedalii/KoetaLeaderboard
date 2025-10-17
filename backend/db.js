import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres.veawvchpitghuqggrdqp',
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Nashed0310..',
  port: 5432,
  ssl: {
    rejectUnauthorized: false 
  }
});

export default pool;
