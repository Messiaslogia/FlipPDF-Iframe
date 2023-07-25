
const path = require('path');
const fs = require('fs');
const multer = require('multer')
const { PDFDocument, PDFImageQuality } = require('pdf-lib');

class UploadController{
   async criarDiretoriosPdfs(req, res){
        // Verifica se o arquivo enviado é um pdf
        if(req.file.mimetype === 'application/pdf'){
            // Retira os caracteres especiais com a exceção do ponto
            const nomeArquivo = req.file.originalname.replace(/[^a-zA-Z0-9\.]/g, '');
            // Coloca o mesmo nome na pasta e  define o caminho
            const nomePasta = nomeArquivo.replace('.pdf', '');
            const pastaDestino = path.join(__dirname, '..', 'views', 'uploads', nomePasta);
            const arquivoDestino = path.join(pastaDestino, nomeArquivo);

            // Verifica se já existe o pdf
            if(fs.existsSync(arquivoDestino)){
                res.render('pdfExistente')
            }else{
                console.log('Novo arquivo enviado')
            }
            // Cria a pasta com o nome do arquivo
            fs.mkdirSync(pastaDestino, { recursive: true });

            // Ler o arquivo PDF enviado pelo cliente
            fs.renameSync(req.file.path, arquivoDestino);
            
            // Cria o arquivo index.html com o embed do PDF
            const html = `
            <!DOCTYPE html>
            <html lang="pt_Br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Iframes pdf</title>
                <link rel="stylesheet" href="/public/stylesheets/css/reset.css">
                <link rel="stylesheet" href="/public/stylesheets/css/style.css">
            </head>
                <script>
                    function copiarIframe() {
                        var iframeTag = "<iframe src='https://amostraebooks.online/uploads/${nomePasta}/${nomeArquivo}' width='100%' height='1000px' type='application/pdf'></iframe>";
                    
                        navigator.clipboard.writeText(iframeTag)
                        .then(function() {
                            alert('A tag do iframe foi copiada para a área de transferência!');
                        })
                        .catch(function(error) {
                            console.error('Erro ao copiar a tag do iframe:', error);
                        });
                    }
                </script>
                <body>
                    <div class="container_iframe">
                        <h1>Seu iframe:</h1>
                            <div class="div_iframe">
                                <pre>
                                    <code>
                                        <xmp><iframe src="https://amostraebooks.online/uploads/${nomePasta}/${nomeArquivo}"  type="application/pdf"></xmp>
                                    </code>
                                </pre>
                            <div class="div_buttons">
                                <button onclick="copiarIframe()">Copiar Livro</button>
                                <a href="/"><button>Voltar ao inicio</button></a>
                            </div>
                        </div>
                    </div>
                    <div id='container_iframeSrc'>
                    
                    </div>
                </body>
                <script>
                    var iframe = document.createElement('iframe');
                    // Define o atributo src vazio inicialmente
                    iframe.src = '';
                    iframe.type= 'application/pdf'
                    iframe.classList.add('iframe')
                    let container = document.querySelector('#container_iframeSrc')

                    // Função para carregar o conteúdo do iframe de forma assíncrona
                    function loadIframeAsync(url) {
                        iframe.src = url;
                        container.appendChild(iframe)
                    }

                    loadIframeAsync('/uploads/${nomePasta}/${nomeArquivo}')
                </script>
                </html>
            `;

            // Cria o arquivo index.html com o embed do PDF
            const iframe = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Visualizar PDF</title>
                </head>
                <!-- Flipbook StyleSheet -->
                <link href="/public/dflip/css/dflip.min.css" rel="stylesheet" type="text/css">
            
                <!-- Icons Stylesheet -->
                <link href="/public/dflip/css/themify-icons.min.css" rel="stylesheet" type="text/css">

                <body>
                <style>
                #text {
                    position: absolute;
                    top: 50%;
                    left: 60%;
                    rotate: -30deg;
                    font-size: 2vw;
                    color: #000;
                    font-family: 'Montserrat', sans-serif;
                    transform: translate(-50%, -50%);
                    -ms-transform: translate(-50%, -50%);
                }

                .df-container>.df-ui-next, .df-container>.df-ui-prev {
                    font-size: 8vw !important;
                }
                .df-container.df-floating>.df-ui-next{
                    right: -340px !important;
                }
                .df-container.df-floating>.df-ui-prev{
                    left: -490px !important;
                }

                @media (max-width: 1000px){
                .df-container.df-floating>.df-ui-next{
                    right: -240px !important;
                }
                .df-container.df-floating>.df-ui-prev{
                    left: -290px !important;
                }
                }
            </style>

                    <div class="container">
                        <div class="row">
                            <div class="col-xs-12" style="padding-bottom:30px">
                            <!--Normal FLipbook-->
                            <div class="_df_book" height="1800px" webgl="true" 
                                    source="/views/uploads/${nomePasta}/${nomeArquivo}">
                            </div>
                            </div>
                        </div>
                    </div>
                    
                </body>
                <script src="/public/dflip/js/libs/jquery.min.js" type="text/javascript"></script>
                <script src="/public/dflip/js/dflip.min.js" type="text/javascript"></script>
                <script>
                    setTimeout(() =>{
                        let divButton = document.querySelector('.df-ui-next')
                        divButton.click()
                    }, 3000)
                </script>
                </html>
            `;

            fs.writeFileSync(path.join(pastaDestino, 'index.ejs'), html);
            fs.writeFileSync(path.join(pastaDestino, 'iframe.html'), iframe);
            res.status(200).render('arquivoEnviado') 
        }else{
            // Retira os caracteres especiais com a exceção do ponto
            const nomeArquivo = req.file.originalname;
            // Apaga o arquivo que o multer moveu para o uploads
            setTimeout(() => {
                fs.unlink(path.join(__dirname, '..', 'views', 'uploads', nomeArquivo), (err) => {
                    if (err) {
                      console.error(err);
                    }
                    console.log('Arquivo excluído com sucesso!');
                });
            }, 1000)
            res.status(400).render('pdfInvalido');
        }
}}

module.exports = new UploadController;