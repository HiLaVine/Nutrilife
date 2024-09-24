const apiUrl = 'http://localhost:3000'; // URL del servidor backend
const spoonacularApiKey = 'e89fd4ec91b04675a6b5d784fe8864d9'; // Reemplaza con tu API Key de Spoonacular
const googleTranslateApiKey = 'AIzaSyAuTGfew_k0HIqzFlQkDTZtCH_aAPZIhos'; // Reemplaza con tu API Key de Google Translate

document.getElementById('regresar-menu').addEventListener('click', function() {
    window.location.href = 'http://127.0.0.1:8000/pacientes/';
});

document.getElementById('añadir-lista').addEventListener('click', function() {
    document.getElementById('no-listas').style.display = 'none';
    document.getElementById('crear-lista').style.display = 'block';
});

document.getElementById('aceptar-lista').addEventListener('click', function() {
    const nombreLista = document.getElementById('nombre-lista').value;
    
    if (nombreLista.trim() === '') {
        document.getElementById('error-nombre-lista').textContent = 'El nombre de la lista no puede estar vacío.';
        document.getElementById('error-nombre-lista').style.display = 'block';
        return;
    }

    fetch(`${apiUrl}/lists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nombreLista,
            date: new Date().toLocaleDateString(),
            status: 'En progreso'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('error-nombre-lista').textContent = 'El nombre de la lista ya existe.';
            document.getElementById('error-nombre-lista').style.display = 'block';
        } else {
            document.getElementById('nombre-lista-mostrado').innerText = nombreLista;
            document.getElementById('crear-lista').style.display = 'none';
            document.getElementById('lista-compras').style.display = 'block';
            document.getElementById('error-nombre-lista').style.display = 'none';
            document.getElementById('lista-compras').dataset.listId = data.id;
        }
    });
});

document.getElementById('cancelar-lista').addEventListener('click', function() {
    document.getElementById('crear-lista').style.display = 'none';
    document.getElementById('no-listas').style.display = 'block';
    document.getElementById('error-nombre-lista').style.display = 'none';
});

document.getElementById('añadir-alimento').addEventListener('click', function() {
    document.getElementById('form-alimento').style.display = 'block';
});

document.getElementById('cancelar-alimento').addEventListener('click', function() {
    document.getElementById('form-alimento').style.display = 'none';
});

document.getElementById('form-nuevo-alimento').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre-alimento').value;
    const cantidad = document.getElementById('cantidad-alimento').value;
    const fechaCompra = document.getElementById('fecha-compra').value;
    const fechaCaducidad = document.getElementById('fecha-caducidad').value;
    const listId = document.getElementById('lista-compras').dataset.listId;
    
    fetch(`${apiUrl}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            list_id: listId,
            name: nombre,
            quantity: cantidad,
            purchase_date: fechaCompra,
            expiry_date: fechaCaducidad
        })
    })
    .then(response => response.json())
    .then(data => {
        const nuevoAlimento = `
            <tr class="alimento-item" data-nombre="${nombre}">
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>${fechaCompra}</td>
                <td>${fechaCaducidad}</td>
                <td><input type="checkbox" class="check-alimento"></td>
            </tr>
        `;
        
        document.getElementById('items-lista').insertAdjacentHTML('beforeend', nuevoAlimento);
        
        // Limpiar formulario
        document.getElementById('form-nuevo-alimento').reset();
        document.getElementById('form-alimento').style.display = 'none';
        document.getElementById('error-datos-lista').style.display = 'none';

        // Actualizar la alacena
        actualizarAlacena();
    });
});

document.getElementById('eliminar-alimentos').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.check-alimento:checked');
    checkboxes.forEach(function(checkbox) {
        const row = checkbox.closest('tr');
        row.remove();
    });

    // Actualizar la alacena
    actualizarAlacena();
});

document.getElementById('terminar-lista').addEventListener('click', function() {
    if (document.getElementById('items-lista').children.length === 0) {
        document.getElementById('error-lista-vacia').style.display = 'block';
    } else {
        document.getElementById('confirmacion-terminar').style.display = 'block';
        document.getElementById('error-lista-vacia').style.display = 'none';
    }
});

document.getElementById('aceptar-terminar').addEventListener('click', function() {
    const nombreLista = document.getElementById('nombre-lista-mostrado').innerText;
    const fecha = new Date().toLocaleDateString();
    const listId = document.getElementById('lista-compras').dataset.listId;
    
    fetch(`${apiUrl}/lists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nombreLista,
            date: fecha,
            status: 'Terminada'
        })
    })
    .then(response => response.json())
    .then(data => {
        const nuevaLista = `
            <tr data-list-id="${listId}">
                <td>${nombreLista}</td>
                <td>${fecha}</td>
                <td>Terminada</td>
                <td><button class="ver-contenido" data-nombre="${nombreLista}">Ver contenido</button></td>
            </tr>
        `;
        document.getElementById('listas-completadas').insertAdjacentHTML('beforeend', nuevaLista);
        
        // Ocultar la lista actual y mostrar la vista general
        document.getElementById('lista-compras').style.display = 'none';
        document.getElementById('confirmacion-terminar').style.display = 'none';
        document.getElementById('vista-general-listas').style.display = 'block';

        // Actualizar la alacena
        actualizarAlacena();
    });
});

document.getElementById('cancelar-terminar').addEventListener('click', function() {
    document.getElementById('confirmacion-terminar').style.display = 'none';
});

// Nuevo Event Listener para añadir una nueva lista desde la vista general
document.getElementById('añadir-nueva-lista').addEventListener('click', function() {
    document.getElementById('vista-general-listas').style.display = 'none';
    document.getElementById('crear-lista').style.display = 'block';
    
    // Limpiar la lista actual
    document.getElementById('items-lista').innerHTML = '';
    document.getElementById('nombre-lista-mostrado').innerText = '';
    document.getElementById('error-nombre-lista').style.display = 'none';
    document.getElementById('error-datos-lista').style.display = 'none';
    document.getElementById('error-lista-vacia').style.display = 'none';
});

// Event Listener para ver el contenido de la lista terminada
document.getElementById('listas-completadas').addEventListener('click', function(event) {
    if (event.target.classList.contains('ver-contenido')) {
        const nombreLista = event.target.getAttribute('data-nombre');
        const listId = event.target.closest('tr').getAttribute('data-list-id');
        
        fetch(`${apiUrl}/items/${listId}`)
            .then(response => response.json())
            .then(data => {
                const itemsLista = data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.purchase_date}</td>
                        <td>${item.expiry_date}</td>
                    </tr>
                `).join('');
                
                document.getElementById('nombre-lista-terminada').innerText = nombreLista;
                document.getElementById('items-lista-terminada').innerHTML = itemsLista;
                
                document.getElementById('vista-general-listas').style.display = 'none';
                document.getElementById('contenido-lista-terminada').style.display = 'block';
            });
    }
});

document.getElementById('volver-listas-completadas').addEventListener('click', function() {
    document.getElementById('contenido-lista-terminada').style.display = 'none';
    document.getElementById('vista-general-listas').style.display = 'block';
});

// Cargar listas y alimentos al iniciar la aplicación
window.onload = function() {
    fetch(`${apiUrl}/lists`)
        .then(response => response.json())
        .then(data => {
            if (data.lists.length > 0) {
                const listas = data.lists.map(list => `
                    <tr data-list-id="${list.id}">
                        <td>${list.name}</td>
                        <td>${list.date}</td>
                        <td>${list.status}</td>
                        <td><button class="ver-contenido" data-nombre="${list.name}">Ver contenido</button></td>
                    </tr>
                `).join('');
                document.getElementById('listas-completadas').innerHTML = listas;
                document.getElementById('no-listas').style.display = 'none';
                document.getElementById('vista-general-listas').style.display = 'block';
            } else {
                document.getElementById('no-listas').style.display = 'block';
                document.getElementById('vista-general-listas').style.display = 'none';
            }
        });

    actualizarAlacena();
};

function actualizarAlacena() {
    fetch(`${apiUrl}/items`)
        .then(response => response.json())
        .then(data => {
            const itemsAlacena = data.items.map(item => `
                <tr class="alimento-item" data-nombre="${item.name}">
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.purchase_date}</td>
                    <td>${item.expiry_date}</td>
                </tr>
            `).join('');
            document.getElementById('items-alacena').innerHTML = itemsAlacena;

            // Llenar el select con los alimentos de la alacena
            const selectOptions = data.items.map(item => `
                <option value="${item.name}">${item.name}</option>
            `).join('');
            document.getElementById('select-ingrediente').innerHTML = selectOptions;
        });
}

// Mostrar la sección de Lista de Compras
document.getElementById('btn-lista-compras').addEventListener('click', function() {
    document.getElementById('alacena').style.display = 'none';
    document.getElementById('recetas').style.display = 'none';
    document.getElementById('lista-de-compras').style.display = 'none';
    document.getElementById('contenido-lista-terminada').style.display = 'none';
    document.getElementById('vista-general-listas').style.display = 'block';
});

// Mostrar la sección de Alacena
document.getElementById('btn-alacena').addEventListener('click', function() {
    document.getElementById('lista-de-compras').style.display = 'none';
    document.getElementById('vista-general-listas').style.display = 'none';
    document.getElementById('contenido-lista-terminada').style.display = 'none';
    document.getElementById('recetas').style.display = 'none';
    document.getElementById('alacena').style.display = 'block';
    actualizarAlacena(); // Actualizar la alacena cada vez que se muestra
});

// Mostrar la sección de Recetas
document.getElementById('btn-recetas').addEventListener('click', function() {
    document.getElementById('lista-de-compras').style.display = 'none';
    document.getElementById('vista-general-listas').style.display = 'none';
    document.getElementById('contenido-lista-terminada').style.display = 'none';
    document.getElementById('alacena').style.display = 'none';
    document.getElementById('recetas').style.display = 'block';
});

// Ocultar la sección de Alacena o Recetas y volver a la lista de compras
document.getElementById('btn-lista-compras').addEventListener('click', function() {
    document.getElementById('alacena').style.display = 'none';
    document.getElementById('recetas').style.display = 'none';
    document.getElementById('añadir-lista').style.display = 'none';
    document.getElementById('lista-de-compras').style.display = 'block';
});

// Event Listener para añadir una nueva receta
document.getElementById('añadir-receta').addEventListener('click', function() {
    document.getElementById('no-recetas').style.display = 'none';
    document.getElementById('crear-receta').style.display = 'block';
});

// Cancelar añadir receta
document.getElementById('cancelar-receta').addEventListener('click', function() {
    document.getElementById('crear-receta').style.display = 'none';
    document.getElementById('no-recetas').style.display = 'block';
    document.getElementById('resultados-receta').style.display = 'none';
});

// Buscar receta con traducción
document.getElementById('buscar-receta').addEventListener('click', function() {
    const ingrediente = document.getElementById('select-ingrediente').value.trim();
    
    if (ingrediente === '') {
        alert('Por favor, seleccione un ingrediente');
        return;
    }

    // Traducir la consulta al inglés
    fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`, {
        method: 'POST',
        body: JSON.stringify({
            q: ingrediente,
            target: 'en'
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(translationData => {
        const translatedIngredient = translationData.data.translations[0].translatedText;
        console.log('Traducido a inglés:', translatedIngredient); // Depuración

        // Buscar recetas en Spoonacular usando el ingrediente traducido
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${translatedIngredient}&apiKey=${spoonacularApiKey}&number=5`)
            .then(response => response.json())
            .then(data => {
                console.log('Resultados de recetas:', data); // Depuración
                if (data.results.length === 0) {
                    alert('No se encontraron recetas para el ingrediente: ' + ingrediente);
                } else {
                    const recetas = data.results.map(recipe => `
                        <li class="receta-item" data-id="${recipe.id}" data-titulo="${recipe.title}">
                            ${recipe.title}
                        </li>
                    `).join('');
                    document.getElementById('lista-recetas').innerHTML = recetas;
                    document.getElementById('resultados-receta').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error al buscar recetas:', error);
                alert('Hubo un problema al buscar recetas. Por favor, inténtelo de nuevo más tarde.');
            });
    })
    .catch(error => {
        console.error('Error al traducir el ingrediente:', error);
        alert('Hubo un problema al traducir el ingrediente. Por favor, inténtelo de nuevo más tarde.');
    });
});

// Event Listener para mostrar la información de la receta en un modal
document.getElementById('lista-recetas').addEventListener('click', function(event) {
    if (event.target.classList.contains('receta-item')) {
        const recetaId = event.target.getAttribute('data-id');
        const recetaTitulo = event.target.getAttribute('data-titulo');
        
        fetch(`https://api.spoonacular.com/recipes/${recetaId}/information?apiKey=${spoonacularApiKey}`)
            .then(response => response.json())
            .then(data => {
                console.log('Detalles de la receta:', data); // Depuración
                const ingredientes = data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('');
                
                // Traducir el contenido usando Google Translate
                const textoATraducir = `
                    Ingredientes: ${ingredientes}
                    Instrucciones: ${data.instructions ? data.instructions : 'No disponible'}
                `;

                fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        q: textoATraducir,
                        target: 'es'
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(translationData => {
                    const translatedText = translationData.data.translations[0].translatedText;
                    console.log('Texto traducido:', translatedText); // Depuración

                    document.getElementById('titulo-receta').innerText = recetaTitulo;
                    document.getElementById('detalles-receta').innerHTML = translatedText;
                    
                    document.getElementById('modal-receta').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error al traducir la receta:', error);
                    alert('Hubo un problema al traducir la receta. Por favor, inténtelo de nuevo más tarde.');
                });
            })
            .catch(error => {
                console.error('Error al obtener detalles de la receta:', error);
                alert('Hubo un problema al obtener los detalles de la receta. Por favor, inténtelo de nuevo más tarde.');
            });
    }
});

// Cerrar el modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal-receta').style.display = 'none';
});

// Cerrar el modal si se hace clic fuera de él
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('modal-receta')) {
        document.getElementById('modal-receta').style.display = 'none';
    }
});

// Event Listener para mostrar la información nutricional de un alimento en la alacena
document.getElementById('items-alacena').addEventListener('click', function(event) {
    if (event.target.closest('tr').classList.contains('alimento-item')) {
        const nombreAlimento = event.target.closest('tr').getAttribute('data-nombre');
        
        // Traducir el nombre del alimento al inglés
        fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                q: nombreAlimento,
                target: 'en'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(translationData => {
            const translatedIngredient = translationData.data.translations[0].translatedText;
            console.log('Traducido a inglés:', translatedIngredient); // Depuración

            // Buscar información nutricional del alimento en Spoonacular
            fetch(`https://api.spoonacular.com/food/ingredients/search?query=${translatedIngredient}&apiKey=${spoonacularApiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const ingredientId = data.results[0].id;
                        fetch(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&unit=serving&apiKey=${spoonacularApiKey}`)
                            .then(response => response.json())
                            .then(nutritionData => {
                                console.log('Información nutricional:', nutritionData); // Depuración
                                const nutrimentos = nutritionData.nutrition.nutrients.map(nutrient => `<li>${nutrient.name}: ${nutrient.amount} ${nutrient.unit}</li>`).join('');
                                const textoNutricional = `
                                    Nombre: ${nutritionData.name}
                                    <ul>${nutrimentos}</ul>
                                `;

                                // Traducir la información nutricional al español
                                fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        q: textoNutricional,
                                        target: 'es'
                                    }),
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => response.json())
                                .then(translationData => {
                                    const translatedText = translationData.data.translations[0].translatedText;
                                    console.log('Texto traducido:', translatedText); // Depuración

                                    // Mostrar la información nutricional en un modal
                                    document.getElementById('titulo-receta').innerText = `Información Nutricional de ${nombreAlimento}`;
                                    document.getElementById('detalles-receta').innerHTML = translatedText;
                                    document.getElementById('modal-receta').style.display = 'block';
                                })
                                .catch(error => {
                                    console.error('Error al traducir la información nutricional:', error);
                                    alert('Hubo un problema al traducir la información nutricional. Por favor, inténtelo de nuevo más tarde.');
                                });
                            })
                            .catch(error => {
                                console.error('Error al obtener la información nutricional:', error);
                                alert('Hubo un problema al obtener la información nutricional. Por favor, inténtelo de nuevo más tarde.');
                            });
                    } else {
                        alert('No se encontró información para el alimento: ' + nombreAlimento);
                    }
                })
                .catch(error => {
                    console.error('Error al buscar el alimento:', error);
                    alert('Hubo un problema al buscar el alimento. Por favor, inténtelo de nuevo más tarde.');
                });
        })
        .catch(error => {
            console.error('Error al traducir el nombre del alimento:', error);
            alert('Hubo un problema al traducir el nombre del alimento. Por favor, inténtelo de nuevo más tarde.');
        });
    }
})