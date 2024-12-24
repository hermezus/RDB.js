const { Command } = require('commander');
const RawDatabase = require('./db');

const program = new Command();

program
  .version('1.0.0')
  .description('CLI to interact with the raw file database');

program
  .command('add <file> <newRow>')
  .description('Adds a new row to the database')
  .action(async (file, newRow) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const result = await database.createRow(newRow);
    if (result) {
      console.log('Row added successfully!');
    } else {
      console.log('Failed to add the row.');
    }
  });

program
  .command('get <file> <page>')
  .description('Retrieves rows from the file with pagination')
  .option('-q, --quantity <quantity>', 'Number of rows per page', 10)
  .option('-a, --asc', 'Order in ascending order', false)
  .action(async (file, page = 1, options) => {
    const { quantity, asc } = options;
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const result = await database.getPaginatedRows({
      quantity: parseInt(quantity),
      asc: asc === 'true',
      page: parseInt(page),
    });

    console.log(`Total rows: ${result.total}`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row}`);
    });
  });

program
  .command('getIndex <file> <index>')
  .description('Retrieves a row by its index')
  .action(async (file, index) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const row = await database.getIndexRow(parseInt(index));
    if (row) {
      console.log(`Row ${index}: ${row}`);
    } else {
      console.log(`No row found at index ${index}`);
    }
  });

program
  .command('deleteByTerm <file> <term>')
  .description('Deletes rows that contain the specified term')
  .action(async (file, term) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const success = await database.deleteByTerm(term);
    if (success) {
      console.log('Rows deleted successfully.');
    } else {
      console.log('No rows found to delete with the given term.');
    }
  });

program
  .command('deleteByIndex <file> <index>')
  .description('Deletes a row by its index')
  .action(async (file, index) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const success = await database.deleteByIndex(parseInt(index));
    if (success) {
      console.log(`Row ${index} deleted successfully.`);
    } else {
      console.log(`Could not delete row ${index}.`);
    }
  });

program
  .command('upgradeByIndex <file> <index> <newData>')
  .description('Updates a row by its index')
  .action(async (file, index, newData) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const success = await database.upgradeByIndex(parseInt(index), newData);
    if (success) {
      console.log(`Row ${index} updated successfully.`);
    } else {
      console.log(`Could not update row ${index}.`);
    }
  });

program
  .command('upgradeByTerm <file> <term> <newData>')
  .description('Updates a row based on the term')
  .action(async (file, term, newData) => {
    const database = new RawDatabase(file, { baseDir: './data', fileExtension: '.dat' });
    const success = await database.upgradeByTerm(term, newData);
    if (success) {
      console.log('Row updated successfully.');
    } else {
      console.log('No row found to update with the given term.');
    }
  });

program.parse(process.argv);
