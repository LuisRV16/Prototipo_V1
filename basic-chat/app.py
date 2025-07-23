# ------------------------------------------------------------------------------------
# A basic Shiny Chat example powered by Anthropic's Claude model.
# ------------------------------------------------------------------------------------
from chatlas import ChatGoogle
from dotenv import load_dotenv
from shiny.express import ui
import mysql.connector
import asyncio



# # Ejecutar una consulta
# cursor.execute("SELECT * FROM persona")

# # Obtener resultados
# resultados = cursor.fetchall()

# for fila in resultados:
#     print(fila)

# ChatAnthropic() requires an API key from Anthropic.
# See the docs for more information on how to obtain one.
# https://posit-dev.github.io/chatlas/reference/ChatAnthropic.html
_ = load_dotenv()

conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="prueba"
)

cursor = conexion.cursor()

chat_client_1 = ChatGoogle(
    system_prompt=
    """Eres un asistente que tiene conocimiento de la base de datos llamada prueba,
    la base de datos prueba tiene la tabla postulantes, la cual cuenta con los atributos,
    id, name, academic_studies (es una descripción de los estudios de la persona) y age.
    En base a estos datos. Debes dar la consulta SQL que se te pida
    y devuelve solamente el comando SQL sin comillas, saltos de linea ni texto adicional.
    """, 
    model="gemini-2.5-flash"
)
system_prompt = ''
async def load_data():
    global system_prompt

    respuesta = await chat_client_1.chat_async("Dame la consulta para obtener todos los registros.")
    sql = await respuesta.get_content()

    print(sql)

    cursor.execute(sql)
    results = cursor.fetchall()

    s = ''

    for row in results:
        s += ', '.join(map(str, row)) + '\n'

    system_prompt= f"""
    Eres un asistente que en base a los datos que te sean pasados 
    y al historial de la conversación, debes responder la pregunta
    o solicitud que se te haga.

    Datos:

    {s}
    """

    print(system_prompt)

# Set some Shiny page options
ui.page_opts(
    fillable=True,
    fillable_mobile=True,
    class_="bg-light-subtle",
)

# Initialize Shiny chat component
chat = ui.Chat(id="chat")

# Display the chat in a card, with welcome message
with ui.card(style="width:min(680px, 100%)", class_="mx-auto"):
    ui.card_header("Hello Gemini Chat")
    chat.ui(
        messages=["Hello! How can I help you today?"],
        width="100%",
    )


# Generate a response when the user submits a message
@chat.on_user_submit
async def handle_user_input(user_input: str):

    await load_data()
    
    chat_client_2 = ChatGoogle(
        system_prompt=system_prompt, 
        model="gemini-2.5-flash"
    )
    response = await chat_client_2.stream_async(user_input)
    await chat.append_message_stream(response)
