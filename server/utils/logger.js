import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  
  if (level === 'ERROR') {
    console.error(logMessage);
  } else if (level === 'WARN') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
};

export default log;
