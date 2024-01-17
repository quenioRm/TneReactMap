function getPermissionsFromLocalStorage(name) {
    const parsedArray = JSON.parse(localStorage.getItem('roles'));
    let result = false;
    parsedArray.map((item, index) => {
        if(name === item.role.name){
            result = true
        }
    })

    return result
}

export default getPermissionsFromLocalStorage;
