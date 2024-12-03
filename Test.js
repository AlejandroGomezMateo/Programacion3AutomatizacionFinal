const { Builder, By, Capabilities, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

// Ruta al archivo HTML local
const url = "file:///G:/ProyectsJS/Proyect-E/index.html"; 

// ruta de la carpeta donde se guardarán las capturas de pantalla
const screenshotPath = path.join(__dirname, 'screenshots');


const edgeCapabilities = Capabilities.edge();
edgeCapabilities.set('acceptSslCerts', true);

// Función para capturar pantallas
async function takeScreenshot(driver, stepName) {
    // Verifica si la carpeta screenshots existe, si no, la crea
    if (!fs.existsSync(screenshotPath)) fs.mkdirSync(screenshotPath);
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(`${screenshotPath}/${stepName}.png`, screenshot, 'base64');
}

// Pruebas automatizadas
async function runTests() {
    const driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .withCapabilities(edgeCapabilities) 
        .build();

    try {
        await driver.get(url);

        // Espera hasta que la página se haya cargado completamente
        await driver.wait(until.titleIs('E-Sneakers'), 10000); 

        // Toma una captura de pantalla justo después de cargar la página
        console.log("Prueba 1: Captura de pantalla al abrir la página");
        await takeScreenshot(driver, "page_opened");

        // Verificar que las imágenes JPG estén visibles
        console.log("Verificando que las imágenes JPG estén visibles...");
        const images = await driver.findElements(By.tagName('img'));

        // Filtrar y verificar las imágenes JPG
        const jpgImages = [];
        for (const image of images) {
            const src = await image.getAttribute('src');
            if (src && src.endsWith('.jpg')) {
                const isVisible = await image.isDisplayed();
                console.log(`Imagen JPG encontrada: ${src} - Visible: ${isVisible}`);
                if (isVisible) jpgImages.push(src);
            }
        }

        if (jpgImages.length === 0) {
            console.error("Ninguna imagen JPG está cargada o visible.");
        } else {
            console.log(`Se encontraron ${jpgImages.length} imágenes JPG visibles.`);
            console.log("Rutas de las imágenes:", jpgImages);
        }

        // Prueba 2: Añadir productos al carrito
        console.log("Prueba 2: Añadir productos al carrito");
        const plusBtn = await driver.findElement(By.className("input_plus"));
        const addToCartBtn = await driver.findElement(By.className("details_button"));
        await plusBtn.click(); // Incrementa cantidad
        await addToCartBtn.click(); // Añade al carrito
        await takeScreenshot(driver, "add_to_cart");

        // Prueba 3: Menú desplegable del carrito
        console.log("Prueba 3: Menú desplegable del carrito");
        const cartIcon = await driver.findElement(By.className("header_cart"));
        await cartIcon.click();
        await takeScreenshot(driver, "cart_dropdown");

        // Prueba 4: Eliminar productos del carrito
        console.log("Prueba 4: Eliminar productos del carrito");
        const deleteBtn = await driver.findElement(By.className("cart-modal_delete"));
        await deleteBtn.click(); 
        await takeScreenshot(driver, "delete_product");

        // Prueba 5: Menú de hamburguesa en mobile
        console.log("Prueba 5: Menú de hamburguesa en mobile");
        const hamburgerMenu = await driver.findElement(By.className("header_menu"));
        await hamburgerMenu.click(); 
        await takeScreenshot(driver, "hamburger_menu");

    } catch (error) {
        console.error("Error durante las pruebas:", error);
    } finally {
        await driver.quit();
    }
}

// Ejecutar pruebas
runTests();
