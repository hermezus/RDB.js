# RDB.js

This project provides a `RawDatabase` class and a command-line interface (CLI) for managing rows in plain text database files. The database files are split into multiple parts, allowing the storage of rows in a structured directory. Each row is stored in a file with a `.dat` extension, and the CLI allows for adding, updating, retrieving, and deleting rows.

## Table of Contents

1. [RawDatabase Class](#rawdatabase-class)
2. [CLI Commands](#cli-commands)
3. [Installation](#installation)
4. [Usage](#usage)

## RawDatabase Class

The `RawDatabase` class is used for interacting with database files. It supports operations like adding rows, retrieving rows with pagination, deleting rows by term or index, and updating rows. Here’s a breakdown of its key functions:

### Constructor
```javascript
new RawDatabase(file, options = {})
```
- `file`: The name of the database file (without extension).
- `options`: Configuration options:
  - `baseDir`: The base directory where the database files are stored. Default is `./data`.
  - `fileExtension`: The extension for the database files. Default is `.dat`.
  - `largeFileSizeLimit`: The file size limit for using `readline` to handle large files (default is 200000 bytes).

### Methods

#### `createRow(newRow)`
Adds a new row to the database if it doesn’t already exist. Returns `true` if successful, `false` otherwise.

#### `getPaginatedRows({ quantity, asc, page })`
Retrieves rows from the database with pagination. Options:
- `quantity`: Number of rows per page (default is 10).
- `asc`: Sort rows in ascending order (`true`) or descending order (`false`).
- `page`: The page number to retrieve.

#### `getIndexRow(index)`
Retrieves a specific row by its index (1-based).

#### `deleteByTerm(term)`
Deletes rows that contain the specified term. Returns `true` if successful, `false` otherwise.

#### `deleteByIndex(index)`
Deletes a row by its index. Returns `true` if successful, `false` otherwise.

#### `upgradeByIndex(index, newData)`
Updates a row by its index with new data. Returns `true` if successful, `false` otherwise.

#### `upgradeByTerm(term, newData)`
Updates a row by the term it contains with new data. Returns `true` if successful, `false` otherwise.
Here are usage examples for the **Class Methods** of the `RawDatabase` class:

---

### 1. **`createRow`**
```javascript
const db = new RawDatabase('Database-RowName');
// Database = Database Name
// RowName = File Name

const newRow = "New row of data";
const success = db.createRow(newRow);
// ./data/Database/RowName.dat

if (success) {
    console.log("Row added successfully!");
} else {
    console.log("Failed to add row.");
}
```

---

### 3. **`getPaginatedRows`**
```javascript
// Retrieve paginated rows with 5 rows per page, sorted in ascending order
const page = 1;  // Page number to fetch
const quantity = 5;  // Number of rows per page
const asc = true;  // Sorting order (ascending)

db.getPaginatedRows({ quantity, asc, page }).then(rows => {
    console.log("Rows from page:", rows);
});
```

---

### 6. **`deleteByIndex`**
```javascript
// Delete a row by its index (1-based index)
const indexToDelete = 3;

const success = db.deleteByIndex(indexToDelete);

if (success) {
    console.log("Row at index " + indexToDelete + " has been deleted.");
} else {
    console.log("Failed to delete row.");
}
```

---

### 7. **`upgradeByIndex`**
```javascript
// Update a row by its index (1-based index) with new data
const indexToUpdate = 4;
const newData = "Updated data";

const success = db.upgradeByIndex(indexToUpdate, newData);

if (success) {
    console.log("Row at index " + indexToUpdate + " has been updated.");
} else {
    console.log("Failed to update row.");
}
```

---

These examples show how to use the methods of the `RawDatabase` class to manipulate data in a simple database with operations for adding, retrieving, updating, and deleting rows.

---

## CLI Commands

This project provides a set of commands for interacting with the `RawDatabase` class via the command-line interface. The CLI uses [Commander.js](https://www.npmjs.com/package/commander) for parsing command-line arguments.

### Commands

#### `add <file> <newRow>`
Adds a new row to the specified file.

```bash
node cli.js add <file> <newRow>
```

- `file`: The name of the database file.
- `newRow`: The row data to be added.

#### `get <file> <page>`
Retrieves rows from the specified file with pagination.

```bash
node cli.js get <file> <page> [options]
```

- `file`: The name of the database file.
- `page`: The page number (starting from 1).
- `--quantity <quantity>`: Number of rows per page (default: 10).
- `--asc`: Sort rows in ascending order (`false` for descending).

#### `getIndex <file> <index>`
Retrieves a row by its index (1-based).

```bash
node cli.js getIndex <file> <index>
```

- `file`: The name of the database file.
- `index`: The row index.

#### `deleteByTerm <file> <term>`
Deletes rows containing the specified term.

```bash
node cli.js deleteByTerm <file> <term>
```

- `file`: The name of the database file.
- `term`: The term to search for in the rows.

#### `deleteByIndex <file> <index>`
Deletes a row by its index.

```bash
node cli.js deleteByIndex <file> <index>
```

- `file`: The name of the database file.
- `index`: The row index (1-based).

#### `upgradeByIndex <file> <index> <newData>`
Updates a row by its index with new data.

```bash
node cli.js upgradeByIndex <file> <index> <newData>
```

- `file`: The name of the database file.
- `index`: The row index (1-based).
- `newData`: The new row data to replace the old one.

#### `upgradeByTerm <file> <term> <newData>`
Updates a row that contains the specified term with new data.

```bash
node cli.js upgradeByTerm <file> <term> <newData>
```

- `file`: The name of the database file.
- `term`: The term to search for in the rows.
- `newData`: The new data to replace the old one.

---

## Installation

To get started with this project, follow the steps below:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/raw-database-cli.git
   ```

2. Navigate to the project directory:
   ```bash
   cd raw-database-cli
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage

You can now use the CLI commands by running the `cli.js` script from the command line. For example, to add a new row to a database file, use:

```bash
node cli.js add myDatabaseFile myNewRow
```

Refer to the command descriptions above for detailed usage instructions for each available command.