# Prototipo_V1
**Ignorar las carpetas basic-chat y Prototipo_v1, estas estan debido a que la primera versión que hice fue un prototipo con el template de Shiny del chat basico. Lo mas potente hasta el momento es lo hecho con Javascript**
Este prototipo se encarga de acceder a una base de datos local llamada prueba, primeramente se obtiene el schema de la base de datos para pasar como contexto junto con la solicitud del usuario al chat de google, en base al schema de base de datos y la solicitud el bot debe crear las consultas SQL, posteriormente estas consultas son procesadas y los resultados se pasan como contexto junto con la solicitud heca por el usuario para dar una respuesta definitiva sin necesidad de que el usuario tenga que procesar o ver código directamente. Simplemente pregunta algo y en base a los resultados de la base de datos, el chat da la respuesta que considera adecuadad.

Psdt. Aún falta implementar RAG_langchain para ser utilizado para el proposito pertinente.
