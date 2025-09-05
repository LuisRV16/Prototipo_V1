# import mysql.connector

# conexion = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     password="1234",
#     database="prueba"
# )

# cursor = conexion.cursor()

# # Ejecutar una consulta
# cursor.execute("SELECT * FROM persona")

# # Obtener resultados
# resultados = cursor.fetchall()

# for fila in resultados:
#     print(fila)

# conexion.close()

import mysql.connector

# Configura tus credenciales
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'prueba'
}

OUTPUT_FILE = f"schema_{DB_CONFIG['database']}.sql"

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print(f"Dumping schema for database: {DB_CONFIG['database']} to {OUTPUT_FILE}")

    # 1. Obtener la lista de tablas
    cursor.execute("SHOW TABLES;")
    tables = [row[0] for row in cursor.fetchall()]

    if not tables:
        print("No tables found in the database.")
        exit()

    f = ''

    for table_name in tables:
        f += (f"-- --------------------------------------------------------\n")
        f += (f"-- Estructura de la tabla {table_name}\n")
        f += (f"-- --------------------------------------------------------\n")

        # 2. Ejecutar SHOW CREATE TABLE para cada tabla
        cursor.execute(f"SHOW CREATE TABLE {table_name};")
        create_table_sql = cursor.fetchone()[1] # La sentencia CREATE TABLE está en la segunda columna (índice 1)

        f += (create_table_sql + ';\n\n') # Añadir el punto y coma final y un salto de línea

    print(f"Schema dump complete: \n\n{f}")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
