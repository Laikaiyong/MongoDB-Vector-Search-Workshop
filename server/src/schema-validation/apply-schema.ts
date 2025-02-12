import '../load-env-vars.js';
import { connectToDatabase, databases } from '../database.js';

const { DATABASE_URI } = process.env;

console.log('Connecting to MongoDB Atlas...');
await connectToDatabase(DATABASE_URI);
const db = databases.library;
console.log('Connected!\n');

const results = [];

const userSchema = {
    bsonType: 'object',
    required: ['name', 'isAdmin'],
    properties: {
        name: {
            bsonType: 'string',
            minLength: 5,
            description: 'must be a string and is required'
        },
        isAdmin: {
            bsonType: 'bool',
            description: 'must be a boolean and is required'
        }
    }
};

console.log('Applying schema validation for users...');
const resultUsers = await db.command({
    collMod: 'users',
    validator: {
        $jsonSchema: userSchema
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

results.push(resultUsers);

const authorSchema = {
    bsonType: 'object',
    required: ['name'],
    properties: {
        name: {
            bsonType: 'string',
            minLength: 5,
            description: 'must be a string and is required'
        },
        // TODO: Add the missing validation rules for the authorSchema
        // Hint: Look at the 'library.authors' collection in
        // the MongoDB Atlas UI
        sanitizedName: {
            bsonType: 'string',
            description: 'must be an string and is required'
        },
        bio: {
            bsonType: ['string', 'null'],
            description: 'must be an string and is optional'
        },
        books: {
            bsonType: 'array',
            description: 'must be an array and is required'
        },
        aliases: {
            bsonType: 'array',
            description: 'must be an array and is required'
        }
    }
};

console.log('Applying schema validation for authors...');
const resultAuthors = await db.command({
    collMod: 'authors',
    validator: {
        $jsonSchema: authorSchema
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

results.push(resultAuthors);


const isStatusInvalid = (r) => r.ok!== 1;
if (results.some(isStatusInvalid)) {
    console.log(results);
    console.error('Failed to enable schema validation!');
    process.exit(1);
} else {
    console.log('Schema validation enabled!');
    process.exit(0);
}
