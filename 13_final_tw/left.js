// conteiner esquerda

// REGRAS
const regras = document.querySelector('.regras');
const regras_table = document.querySelector('.regras_table');

regras_table.style.display = 'none'
regras.addEventListener('click', function(){
    if (regras_table.style.display === 'none') {
        regras_table.style.display = 'block'; // Exibir o container
    } else {
        regras_table.style.display = 'none'; // Ocultar o container
    }
});



// RANKING /geral e Póprio?

