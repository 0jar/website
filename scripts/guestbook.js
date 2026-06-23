import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../src/content/guestbook/guestbook.csv');

try {
  if (!fs.existsSync(csvPath)) {
    console.log("No guestbook CSV found to prune.");
    process.exit(0);
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  
  // Parse the CSV
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  // Filter out PII columns: email, ip, user_agent
  const prunedRecords = records.map(record => {
    delete record.email;
    delete record.ip;
    delete record.user_agent;
    return record;
  });

  // Stringify the data back into CSV
  const outputCsv = stringify(prunedRecords, { header: true });

  // Overwrite the original file
  fs.writeFileSync(csvPath, outputCsv);
  console.log("Successfully pruned PII from guestbook.csv!");
} catch (e) {
  console.error("Failed to prune guestbook CSV:", e);
  process.exit(1);
}
