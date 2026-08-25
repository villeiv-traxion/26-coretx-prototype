-- ============================================================================
--  MDM · el maestro de datos — esquema operacional
--  PostgreSQL 16 · español, como todo el dominio
--
--  Se prueba contra una base desechable, nunca contra la del producto:
--
--    docker exec -i coretx_captura_db psql -U coretx -d postgres \
--      -c "DROP DATABASE IF EXISTS mdm_prueba" -c "CREATE DATABASE mdm_prueba"
--    docker exec -i coretx_captura_db psql -U coretx -d mdm_prueba \
--      -v ON_ERROR_STOP=1 < MDM/02_esquema.sql
--
--  Tres principios heredados del producto, aquí convertidos en esquema:
--    · nada se borra — vigencias (`desde`/`hasta`) y banderas, nunca DELETE físico
--    · publicar el hueco — columnas nulas con COMMENT que dice quién lo cierra
--    · el origen de cada dato es un dato — enum `origen_del_registro` en los maestros
-- ============================================================================

-- ------------------------------------------------------------------ enumerados

CREATE TYPE origen_del_registro AS ENUM ('SEMILLA', 'DERIVADO', 'MANUAL', 'EJEMPLO');
COMMENT ON TYPE origen_del_registro IS
  'De dónde salió el renglón. DERIVADO = deducido de nombres u otras señales, por confirmar. '
  'EJEMPLO = generado para demostrar la estructura; nunca alimenta una decisión.';

CREATE TYPE estado_de_cliente AS ENUM ('POR_CONFIRMAR', 'CONFIRMADO', 'INACTIVO');

CREATE TYPE clase_de_negocio AS ENUM
  ('ALMACEN', 'CROSSDOCK', 'OFICINA', 'PAQUETERIA', 'ULTIMA_MILLA', 'TRANSPORTE', 'DISTRIBUCION');

CREATE TYPE nivel_de_alcance AS ENUM ('DIVISION', 'COMPANIA', 'NEGOCIO', 'OPERACION', 'CLIENTE', 'CONTRATO');
COMMENT ON TYPE nivel_de_alcance IS
  'Sobre qué se define un alcance: de un indicador (dónde se mide) o de una responsabilidad '
  '(sobre qué manda una persona).';

CREATE TYPE canal_de_dato AS ENUM ('MANUAL', 'AUTOMATIZADO');
CREATE TYPE estado_de_conexion AS ENUM ('PENDIENTE', 'EN_PRUEBAS', 'CONECTADO', 'RETIRADO');

CREATE TYPE verbo_de_responsabilidad AS ENUM ('ADMINISTRA', 'CAPTURA', 'CONSULTA');
COMMENT ON TYPE verbo_de_responsabilidad IS
  'Qué hace la persona sobre el ámbito. La asignación de CoreTX Captura es el caso '
  'CAPTURA × OPERACION; un director es CONSULTA × COMPANIA; el dueño del maestro, '
  'ADMINISTRA × DIVISION.';

CREATE TYPE tipo_de_indicador AS ENUM ('PORCENTAJE', 'NPS', 'CONTEO', 'TASA');
CREATE TYPE sentido_del_indicador AS ENUM ('MAS_ES_MEJOR', 'MENOS_ES_MEJOR', 'NEUTRO');
CREATE TYPE frecuencia AS ENUM ('SEMANAL', 'MENSUAL', 'SEMESTRAL', 'AL_OCURRIR');

-- ================================================================ BLOQUE A
--  La estructura corporativa: división → compañía → negocio → operación,
--  más cliente y contrato.
-- ============================================================================

CREATE TABLE division (
  id      text PRIMARY KEY,
  nombre  text NOT NULL UNIQUE,
  origen  origen_del_registro NOT NULL DEFAULT 'MANUAL',
  activa  boolean NOT NULL DEFAULT true
);

CREATE TABLE compania (
  id           text PRIMARY KEY,
  nombre       text NOT NULL UNIQUE,
  corporativo  text NOT NULL,
  division_id  text NOT NULL REFERENCES division(id),
  origen       origen_del_registro NOT NULL DEFAULT 'MANUAL',
  activa       boolean NOT NULL DEFAULT true
);

CREATE TABLE negocio (
  id      text PRIMARY KEY,
  nombre  text NOT NULL UNIQUE,
  clase   clase_de_negocio,
  origen  origen_del_registro NOT NULL DEFAULT 'MANUAL',
  activo  boolean NOT NULL DEFAULT true
);
COMMENT ON COLUMN negocio.clase IS
  'Nace en nulo: la semilla no la trae y adivinarla sería inventar. La cierra el administrador.';

CREATE TABLE territorio (
  id      text PRIMARY KEY,
  nombre  text NOT NULL UNIQUE,
  origen  origen_del_registro NOT NULL DEFAULT 'MANUAL',
  activo  boolean NOT NULL DEFAULT true
);
COMMENT ON TABLE territorio IS
  'Los cinco derivados (CEN, MET, OCC, NTE, K & M) salen de los sufijos de SID y van con '
  'origen DERIVADO. No existe un eje territorial verificado para el resto: no se inventa.';

CREATE TABLE operacion (
  id                        text PRIMARY KEY,
  nombre                    text NOT NULL,
  compania_id               text NOT NULL REFERENCES compania(id),
  negocio_id                text NOT NULL REFERENCES negocio(id),
  territorio_id             text REFERENCES territorio(id),
  sitio                     text,
  clase                     clase_de_negocio,
  sistema_declarado         text,
  activo                    boolean NOT NULL DEFAULT true,
  contacto_captura          text,
  contacto_captura_correo   text,
  contacto_ti               text,
  contacto_ti_correo        text,
  escala_a_rol              text,
  escala_a_correo           text
);
COMMENT ON COLUMN operacion.clase IS 'Hueco abierto en las 141 sembradas (§15.5).';
COMMENT ON COLUMN operacion.sistema_declarado IS
  'NULL cuando el análisis dice «Sin información» (46). Ojo: otras 44 dicen «Sistema '
  'independinete» — la cifra publicada de 90 las suma, y decidir si eso es un sistema o un '
  'hueco es una decisión de catálogo pendiente.';
COMMENT ON COLUMN operacion.escala_a_correo IS 'Hoy nulo en las 141. Dirección de Logística lo cierra.';

CREATE INDEX operacion_por_compania ON operacion (compania_id) WHERE activo;
CREATE INDEX operacion_por_negocio ON operacion (negocio_id) WHERE activo;
CREATE INDEX operacion_por_territorio ON operacion (territorio_id) WHERE territorio_id IS NOT NULL;

CREATE TABLE cliente (
  id      text PRIMARY KEY,
  nombre  text NOT NULL,
  estado  estado_de_cliente NOT NULL DEFAULT 'POR_CONFIRMAR',
  origen  origen_del_registro NOT NULL DEFAULT 'MANUAL',
  UNIQUE (nombre)
);
COMMENT ON TABLE cliente IS
  'Los ~87 derivados de los nombres de operación nacen POR_CONFIRMAR con origen DERIVADO. '
  'Confirmarlos —o fusionarlos: ¿«Samsung», «Samsung PIQ» y «SDS Samsung» son uno?— es '
  'trabajo del administrador del maestro, no de una heurística.';

CREATE TABLE contrato (
  id           text PRIMARY KEY,
  cliente_id   text NOT NULL REFERENCES cliente(id),
  compania_id  text NOT NULL REFERENCES compania(id),
  origen       origen_del_registro NOT NULL DEFAULT 'MANUAL',
  desde        date,
  hasta        date,
  CHECK (hasta IS NULL OR hasta >= desde)
);
COMMENT ON TABLE contrato IS
  'No existe ni un dato de contrato en ninguna fuente. Los de la demostración van con '
  'origen EJEMPLO y jamás llevan cifras de dinero. Cuando lleguen los reales, la moneda, '
  'la tarifa y el vencimiento se agregan aquí — y habilitan fact_ingreso en el lake.';

CREATE TABLE contrato_operacion (
  contrato_id   text NOT NULL REFERENCES contrato(id),
  operacion_id  text NOT NULL REFERENCES operacion(id),
  desde         date NOT NULL DEFAULT CURRENT_DATE,
  hasta         date,
  PRIMARY KEY (contrato_id, operacion_id, desde)
);
COMMENT ON TABLE contrato_operacion IS
  'Qué operaciones sirven cada contrato, con vigencia: una operación multicliente '
  '(los sitios «Multicuentas», los CEDIS de Medistik) aparece en varios contratos.';

-- ================================================================ BLOQUE B
--  Indicadores: qué se mide, sobre qué nivel, y por qué canal llega el dato.
-- ============================================================================

CREATE TABLE indicador (
  id          text PRIMARY KEY,
  nombre      text NOT NULL,
  dominio     text NOT NULL,
  prioridad   int  NOT NULL,
  frecuencia  frecuencia NOT NULL,
  corte       text NOT NULL,
  tipo        tipo_de_indicador NOT NULL,
  sentido     sentido_del_indicador NOT NULL,
  activo      boolean NOT NULL DEFAULT true
);
COMMENT ON TABLE indicador IS
  'La definición, no el número. Los campos, fórmulas y las 239 reglas viven en el sistema '
  'de captura (el conector del canal MANUAL); el maestro guarda la identidad y la taxonomía.';
COMMENT ON COLUMN indicador.tipo IS '⚠️ Derivado de los datos, sin firma de dominio.';

CREATE TABLE indicador_alcance (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  indicador_id  text NOT NULL REFERENCES indicador(id),
  nivel         nivel_de_alcance NOT NULL,
  nivel_id      text NOT NULL,
  desde         date NOT NULL DEFAULT CURRENT_DATE,
  hasta         date,
  UNIQUE (indicador_id, nivel, nivel_id, desde)
);
COMMENT ON TABLE indicador_alcance IS
  '**De aquí salen los envíos esperados** — la invariante nº 1 del producto, generalizada: '
  'un alcance sobre COMPANIA cubre todas sus operaciones activas; sobre CONTRATO, las que '
  'lo sirven. Si los esperados salieran de la responsabilidad, una operación sin '
  'responsable dejaría de deberse y su hueco sería invisible.';
CREATE INDEX alcance_vigente ON indicador_alcance (nivel, nivel_id) WHERE hasta IS NULL;

CREATE TABLE origen_de_dato (
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  indicador_id          text NOT NULL REFERENCES indicador(id),
  canal                 canal_de_dato NOT NULL DEFAULT 'MANUAL',
  sistema_origen        text,
  semana_de_transicion  int,
  estado_conexion       estado_de_conexion NOT NULL DEFAULT 'PENDIENTE',
  desde                 date NOT NULL DEFAULT CURRENT_DATE,
  hasta                 date,
  UNIQUE (indicador_id, desde)
);
COMMENT ON TABLE origen_de_dato IS
  'El calendario de apagado (S14/S20/S40/S42) como dato administrable en vez de nota. '
  'CoreTX Captura es el conector del canal MANUAL: cuando un indicador pasa a AUTOMATIZADO '
  '(estado CONECTADO), deja de esperarse por captura y empieza a esperarse por el conector. '
  '⚠️ El AÑO de la semana de transición no está en ninguna fuente: lo cierra Tecnología.';

-- ================================================================ BLOQUE C
--  Personas: quién administra, captura o consulta cada nivel.
-- ============================================================================

CREATE TABLE usuario (
  id      text PRIMARY KEY,
  nombre  text NOT NULL,
  correo  text UNIQUE,
  origen  origen_del_registro NOT NULL DEFAULT 'MANUAL',
  activo  boolean NOT NULL DEFAULT true
);

CREATE TABLE responsabilidad (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id  text NOT NULL REFERENCES usuario(id),
  verbo       verbo_de_responsabilidad NOT NULL,
  nivel       nivel_de_alcance NOT NULL,
  nivel_id    text NOT NULL,
  origen      origen_del_registro NOT NULL DEFAULT 'MANUAL',
  desde       date NOT NULL DEFAULT CURRENT_DATE,
  hasta       date
);
COMMENT ON TABLE responsabilidad IS
  'Generaliza la Asignacion de Captura (el caso CAPTURA × OPERACION). Se retira poniendo '
  '`hasta`, nunca borrando: la bitácora vieja tiene que seguir explicándose sola. '
  'Más de dos responsables del mismo ámbito se permite; desde el tercero se avisa, no se '
  'bloquea (decisión tomada en el producto).';
CREATE INDEX responsabilidad_vigente ON responsabilidad (nivel, nivel_id, verbo) WHERE hasta IS NULL;
CREATE INDEX responsabilidad_por_usuario ON responsabilidad (usuario_id) WHERE hasta IS NULL;

-- ================================================================ VISTAS

CREATE VIEW v_arbol_corporativo AS
SELECT d.id  AS division_id,  d.nombre AS division,
       c.id  AS compania_id,  c.nombre AS compania, c.corporativo,
       n.id  AS negocio_id,   n.nombre AS negocio,  n.clase AS clase_de_negocio,
       o.id  AS operacion_id, o.nombre AS operacion,
       t.nombre AS territorio, o.activo
FROM division d
JOIN compania  c ON c.division_id = d.id
JOIN operacion o ON o.compania_id = c.id
JOIN negocio   n ON n.id = o.negocio_id
LEFT JOIN territorio t ON t.id = o.territorio_id;

CREATE VIEW v_alcance_resuelto AS
-- Cada alcance vigente, bajado a operaciones concretas. Es lo que abre un periodo.
SELECT a.indicador_id, o.id AS operacion_id
FROM indicador_alcance a
JOIN operacion o ON (
      (a.nivel = 'OPERACION' AND o.id = a.nivel_id)
   OR (a.nivel = 'COMPANIA'  AND o.compania_id = a.nivel_id)
   OR (a.nivel = 'NEGOCIO'   AND o.negocio_id = a.nivel_id)
   OR (a.nivel = 'CONTRATO'  AND o.id IN (
         SELECT co.operacion_id FROM contrato_operacion co
         WHERE co.contrato_id = a.nivel_id AND co.hasta IS NULL))
   OR (a.nivel = 'CLIENTE'   AND o.id IN (
         SELECT co.operacion_id FROM contrato_operacion co
         JOIN contrato ct ON ct.id = co.contrato_id
         WHERE ct.cliente_id = a.nivel_id AND co.hasta IS NULL))
)
WHERE a.hasta IS NULL AND o.activo;

CREATE VIEW v_carga_por_persona AS
-- Cuántas operaciones alcanza cada persona con verbo CAPTURA. El denominador de la
-- conversación sobre concentración.
SELECT u.id AS usuario_id, u.nombre,
       count(DISTINCT o.id) AS operaciones
FROM usuario u
JOIN responsabilidad r ON r.usuario_id = u.id AND r.verbo = 'CAPTURA' AND r.hasta IS NULL
JOIN operacion o ON (
      (r.nivel = 'OPERACION' AND o.id = r.nivel_id)
   OR (r.nivel = 'COMPANIA'  AND o.compania_id = r.nivel_id)
   OR (r.nivel = 'NEGOCIO'   AND o.negocio_id = r.nivel_id)
)
WHERE o.activo
GROUP BY u.id, u.nombre;

CREATE VIEW v_calidad_del_maestro AS
SELECT
  (SELECT count(*) FROM operacion WHERE clase IS NULL)                            AS operaciones_sin_clase,
  (SELECT count(*) FROM operacion WHERE sistema_declarado IS NULL)                AS operaciones_sin_sistema,
  (SELECT count(*) FROM operacion WHERE escala_a_correo IS NULL)                  AS escalaciones_en_nulo,
  (SELECT count(*) FROM cliente   WHERE estado = 'POR_CONFIRMAR')                 AS clientes_por_confirmar,
  (SELECT count(*) FROM contrato  WHERE origen = 'EJEMPLO')                       AS contratos_de_ejemplo,
  (SELECT count(*) FROM negocio   WHERE clase IS NULL)                            AS negocios_sin_clase,
  (SELECT count(*) FROM origen_de_dato WHERE estado_conexion = 'PENDIENTE' AND hasta IS NULL) AS conexiones_pendientes,
  (SELECT count(*) FROM operacion o WHERE o.activo AND NOT EXISTS (
      SELECT 1 FROM responsabilidad r
      WHERE r.verbo = 'CAPTURA' AND r.hasta IS NULL
        AND ((r.nivel = 'OPERACION' AND r.nivel_id = o.id)
          OR (r.nivel = 'COMPANIA'  AND r.nivel_id = o.compania_id))))            AS operaciones_sin_captura;

-- ================================================================ VERIFICACIÓN
--  Datos de humo + aserciones. Si esto no pasa, el esquema está roto, no los datos.
-- ============================================================================

DO $$
DECLARE resueltas int;
BEGIN
  INSERT INTO division VALUES ('DIV01', 'Logística', 'SEMILLA', true);
  INSERT INTO compania VALUES ('CIA01', 'Medistik', 'Medistik', 'DIV01', 'SEMILLA', true);
  INSERT INTO negocio  VALUES ('NG01', 'Contract Logistics Health', NULL, 'DERIVADO', true);
  INSERT INTO territorio VALUES ('TER01', 'CEN', 'DERIVADO', true);
  INSERT INTO operacion (id, nombre, compania_id, negocio_id, territorio_id, activo)
    VALUES ('S155', 'Coecillo', 'CIA01', 'NG01', 'TER01', true),
           ('S156', 'Doña Rosa', 'CIA01', 'NG01', NULL, true);
  INSERT INTO cliente VALUES ('CL001', 'Pisa', 'POR_CONFIRMAR', 'DERIVADO');
  INSERT INTO contrato (id, cliente_id, compania_id, origen, desde)
    VALUES ('CT001', 'CL001', 'CIA01', 'EJEMPLO', '2026-01-01');
  INSERT INTO contrato_operacion (contrato_id, operacion_id, desde)
    VALUES ('CT001', 'S155', '2026-01-01');
  INSERT INTO indicador VALUES
    ('L02', 'Nivel de Servicio | IRA', 'Almacén', 1, 'SEMANAL', 'viernes 14:00',
     'PORCENTAJE', 'MAS_ES_MEJOR', true);
  -- Un alcance por COMPANIA cubre las dos operaciones; uno por CLIENTE, sólo la del contrato.
  INSERT INTO indicador_alcance (indicador_id, nivel, nivel_id) VALUES ('L02', 'COMPANIA', 'CIA01');
  SELECT count(*) INTO resueltas FROM v_alcance_resuelto WHERE indicador_id = 'L02';
  ASSERT resueltas = 2, format('alcance por compañía: esperaba 2, salió %s', resueltas);

  UPDATE indicador_alcance SET hasta = CURRENT_DATE;
  INSERT INTO indicador_alcance (indicador_id, nivel, nivel_id) VALUES ('L02', 'CLIENTE', 'CL001');
  SELECT count(*) INTO resueltas FROM v_alcance_resuelto WHERE indicador_id = 'L02';
  ASSERT resueltas = 1, format('alcance por cliente: esperaba 1, salió %s', resueltas);

  INSERT INTO usuario VALUES ('U01', 'Gerardo Fajardo', 'g.fajardod@traxion.global', 'DERIVADO', true);
  INSERT INTO responsabilidad (usuario_id, verbo, nivel, nivel_id, origen)
    VALUES ('U01', 'CAPTURA', 'COMPANIA', 'CIA01', 'DERIVADO');
  SELECT operaciones INTO resueltas FROM v_carga_por_persona WHERE usuario_id = 'U01';
  ASSERT resueltas = 2, format('carga por persona: esperaba 2, salió %s', resueltas);

  ASSERT (SELECT operaciones_sin_clase FROM v_calidad_del_maestro) = 2;
  ASSERT (SELECT contratos_de_ejemplo FROM v_calidad_del_maestro) = 1;

  RAISE NOTICE 'MDM: esquema íntegro — % aserciones de humo en verde', 5;
END $$;
