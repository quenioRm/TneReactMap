// processLaravelErrors.js

function getFirstErrorMessage(responseObject) {
    // Check if the responseObject has an 'error' key and it's an object with properties
    if (
        responseObject &&
        responseObject.error &&
        typeof responseObject.error === "object" &&
        Object.keys(responseObject.error).length > 0
    ) {
        // Get the first key from the error object
        const firstKey = Object.keys(responseObject.error)[0];

        // Check if the value of this key is an array and has at least one message
        if (
            Array.isArray(responseObject.error[firstKey]) &&
            responseObject.error[firstKey].length > 0
        ) {
            // Return the first message of the first key

            return responseObject.error[firstKey][0];
        }
    }
    // Return a default message if no specific errors were found
    return "An unknown error occurred.";
}

// Export the function for use in other files
export default getFirstErrorMessage;
