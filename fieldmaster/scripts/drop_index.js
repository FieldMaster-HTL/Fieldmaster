require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to DB');
    const res1 = await client.query('DROP INDEX IF EXISTS "task_tools_taskId_toolId_unique"');
    console.log('DROP INDEX result:', res1.command);
    const res2 = await client.query('DROP INDEX IF EXISTS "task_tools_task_id_idx"');
    console.log('DROP INDEX result:', res2.command);
    const res3 = await client.query('DROP INDEX IF EXISTS "task_tools_tool_id_idx"');
    console.log('DROP INDEX result:', res3.command);
  } catch (err) {
    console.error('Error dropping index:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
