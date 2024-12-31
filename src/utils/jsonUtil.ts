// cause JSON of javascript does not support Date object and undefined, so we need to convert Date object to string and vice versa

// Replacer function for JSON.stringify
const replacer = (key: string, value: any): any => {
    if (value instanceof Date) {
        return value.toISOString(); // Convert Date to ISO string
    }
    if (value === undefined) {
        return "undefined"; // Represent undefined as "undefined"
    }
    return value;
};

// Reviver function for JSON.parse
const reviver = (key: string, value: any): any => {
    // Check if the value is an ISO date string
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
        return new Date(value); // Convert ISO string back to Date
    }

    // Convert "undefined" string back to undefined
    if (value === "undefined") {
        return undefined;
    }

    return value; // Return as is for other types
};

export {reviver, replacer};