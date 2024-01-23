function toTitleCase(str) {
    try {
        const words = str.split(/\s+/);

        const textoEmTitleCase = words.map(function (word, index) {
            // Verifica se a palavra começa com letra maiúscula
            const isFirstLetterUppercase = /^[A-Z]/.test(word);

            if (index === 0 || isFirstLetterUppercase) {
                // Para a primeira palavra ou palavras que começam com letra maiúscula, mantenha a primeira letra em maiúscula, independentemente do caractere
                return (
                    word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
                );
            } else {
                // Para as outras palavras, aplique o título case normalmente
                return (
                    word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
                );
            }
        });

        return textoEmTitleCase.join(" ");
    } catch (error) {
        return str;
    }
}

export default toTitleCase;
