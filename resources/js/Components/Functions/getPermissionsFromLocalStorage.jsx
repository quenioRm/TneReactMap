function getPermissionsFromLocalStorage(name) {
    try {
        const parsedArray = JSON.parse(localStorage.getItem("roles"));
        let result = false;
        parsedArray.map((item, index) => {
            if (name === item.role.name) {
                result = true;
            }
        });

        return result;
    } catch (error) {
        return false;
    }
}

export default getPermissionsFromLocalStorage;
