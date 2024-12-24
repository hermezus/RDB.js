const fs = require('fs');
const readline = require('readline');

const path = require('path');

class RawDatabase {
    constructor(file, options = {}) {
        this.file = file;
        this.baseDir = options.baseDir || './data';
        this.fileExtension = options.fileExtension || '.dat';
        this.largeFileSizeLimit = options.largeFileSizeLimit || 200000;
    }

    async splitPath() {
        const fileParts = this.file.split('-');
        const fileName = `${fileParts[fileParts.length - 1]}${this.fileExtension}`;
        const dirPath = path.join(this.baseDir, ...fileParts.slice(0, -1));
        const filePath = `${dirPath}/${fileName}`;
        
        return { dirPath, fileParts, filePath, fileName };
    }

    async createRow(newRow) {
        const { dirPath, fileName } = await this.splitPath();
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (err) {
            return false;
        }

        if (!newRow.trim()) return false;

        try {
            let data;
            try {
                data = await fs.promises.readFile(path.join(dirPath, fileName), 'utf8');
            } catch (err) {
                if (err.code === 'ENOENT') {
                    await fs.promises.writeFile(path.join(dirPath, fileName), `${newRow}\n`);
                    return true;
                }
                return false;
            }

            const sanitizedRow = newRow.trim().toLowerCase();
            const fileLines = data.trim().split('\n');
            const duplicateExists = fileLines.some(line => line.trim().toLowerCase() === sanitizedRow);

            if (duplicateExists) return false;

            await fs.promises.appendFile(path.join(dirPath, fileName), `${newRow}\n`);
            return true;
        } catch (err) {
            return false;
        }
    }

    async getPaginatedRows({ quantity = 10, asc = true, page = 1 }) {
        const { filePath } = await this.splitPath();
        
        const lines = [];
        let total = 0;
        let startIndex = (page - 1) * quantity;
        let endIndex = startIndex + quantity;

        try {
            const fileStats = await fs.promises.stat(filePath);
            const isLargeFile = fileStats.size > this.largeFileSizeLimit;

            if (isLargeFile) {
                const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
                const rl = readline.createInterface({
                    input: stream,
                    output: process.stdout,
                    terminal: false
                });

                rl.on('line', (line) => {
                    if (line.trim()) {
                        lines.push(line.trim());
                        total++;
                    }
                });

                await new Promise((resolve, reject) => {
                    rl.on('close', () => resolve());
                    rl.on('error', (err) => reject(err));
                });
            } else {
                const data = await fs.promises.readFile(filePath, 'utf8');
                const fileLines = data.trim().split('\n');
                lines.push(...fileLines.filter(line => line.trim()));
                total = lines.length;
            }

            const sortedLines = asc ? lines.sort((a, b) => a.localeCompare(b)) : lines.sort((a, b) => b.localeCompare(a));

            return {
                rows: sortedLines.slice(startIndex, endIndex),
                total: total
            };
        } catch (error) {
            return { rows: [], total: 0 };
        }
    }

    async getIndexRow(index) {
        const { filePath } = await this.splitPath();
        
        try {
            const fileStats = await fs.promises.stat(filePath);
            const isLargeFile = fileStats.size > this.largeFileSizeLimit;
            let result = null;

            if (isLargeFile) {
                const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
                const rl = readline.createInterface({
                    input: stream,
                    output: process.stdout,
                    terminal: false
                });

                let lineCount = 0;
                for await (const line of rl) {
                    lineCount++;
                    if (lineCount === index) {
                        result = line.trim();
                        break;
                    }
                }
            } else {
                const data = await fs.promises.readFile(filePath, 'utf8');
                const fileLines = data.trim().split('\n');
                if (index > 0 && index <= fileLines.length) {
                    result = fileLines[index - 1].trim();
                }
            }

            return result || null;
        } catch (error) {
            return null;
        }
    }

    async deleteByTerm(term) {
        const { filePath } = await this.splitPath();
        
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            if (!data.trim()) return false;

            const lines = data.split('\n').filter(line => line.trim() !== '');
            const updatedLines = lines.filter(line => !line.toLowerCase().includes(term.toLowerCase()));

            if (lines.length === updatedLines.length) return false;

            await fs.promises.writeFile(filePath, updatedLines.join('\n') + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }

    async deleteByIndex(index) {
        const { filePath } = await this.splitPath();
        
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            if (!data.trim()) return false;

            const lines = data.split('\n').filter(line => line.trim() !== '');
            if (index < 1 || index > lines.length) return false;

            lines.splice(index - 1, 1);
            await fs.promises.writeFile(filePath, lines.join('\n') + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }

    async upgradeByIndex(index, newData) {
        const { filePath } = await this.splitPath();
        
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            if (!data.trim()) return false;

            const lines = data.split('\n').filter(line => line.trim() !== '');
            if (index < 1 || index > lines.length) return false;

            lines[index - 1] = newData;
            await fs.promises.writeFile(filePath, lines.join('\n') + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }

    async upgradeByTerm(term, newData) {
        const { filePath } = await this.splitPath();
        
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            if (!data.trim()) return false;

            const lines = data.split('\n').filter(line => line.trim() !== '');
            const index = lines.findIndex(line => line.toLowerCase().includes(term.toLowerCase()));

            if (index === -1) return false;

            lines[index] = newData;
            await fs.promises.writeFile(filePath, lines.join('\n') + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = RawDatabase;
