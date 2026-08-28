-- Inserción de base de conocimiento ampliada para el Tenant Demo
-- Cobertura de ~300 preguntas y casos frecuentes distribuidos en artículos temáticos estructurados

DELETE FROM "KnowledgeBaseArticles" WHERE "TenantId" = '5303da30-d1f9-4a61-922f-fd4319e45037';

INSERT INTO "KnowledgeBaseArticles" ("Id", "TenantId", "Title", "Content", "IsActive", "CreatedAtUtc", "Vector")
VALUES
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Políticas Generales de Garantía y Cobertura',
  'Todos los productos comercializados cuentan con una garantía legal de fábrica de 30 a 90 días calendario según la categoría. Cubre defectos de fabricación, fallas de funcionamiento no atribuibles a mal uso y piezas defectuosas. No cubre daños por humedad, golpes o alteraciones no autorizadas.',
  true,
  NOW() - INTERVAL '30 days',
  array_fill(0.012::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Procedimiento para Solicitar una Garantía',
  'Para hacer efectiva la garantía debes: 1. Presentar tu factura electrónica o número de cédula del comprador. 2. Describir la falla en el producto. 3. Enviar el producto a revisión técnica. El diagnóstico toma de 3 a 5 días hábiles y se procede con reparación, cambio o reembolso.',
  true,
  NOW() - INTERVAL '28 days',
  array_fill(0.015::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Tiempos de Entrega y Cobertura de Envíos Nacionales',
  'Realizamos envíos a todo el territorio nacional. Ciudades principales (Bogotá, Medellín, Cali, Barranquilla): 2 a 3 días hábiles. Otras ciudades y municipios intermedios: 3 a 5 días hábiles. Zonas de difícil acceso: hasta 8 días hábiles. Recibirás tu guía de rastreo por correo.',
  true,
  NOW() - INTERVAL '25 days',
  array_fill(0.022::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Costos de Envío y Tarifas de Flete',
  'Los envíos son gratuitos para compras superiores a $150.000 COP. Para órdenes de menor valor, la tarifa estándar es de $12.000 COP en ciudades principales y $18.000 COP para trayectos especiales.',
  true,
  NOW() - INTERVAL '24 days',
  array_fill(0.018::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Rastreo y Seguimiento de Pedidos en Tránsito',
  'Una vez despachado el paquete, te enviamos un SMS y correo con el número de guía y el enlace de la transportadora (Coordinadora, Servientrega o Envía). También puedes rastrear tu envío con tu número de pedido desde nuestro portal.',
  true,
  NOW() - INTERVAL '22 days',
  array_fill(0.025::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Derecho de Retracto y Devolución de Dinero',
  'De acuerdo con el Estatuto del Consumidor (Ley 1480), dispones de 5 días hábiles tras recibir el producto para ejercer el derecho de retracto. El artículo debe estar nuevo, sin uso y con empaques originales. El reembolso se efectúa en un plazo máximo de 15 días hábiles.',
  true,
  NOW() - INTERVAL '20 days',
  array_fill(0.019::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Métodos de Pago Aceptados y Pasarelas Seguras',
  'Aceptamos pagos a través de Wompi y PayU con tarjetas de crédito (Visa, Mastercard, Amex), tarjetas débito con código CVV, transferencias PSE (todos los bancos colombianos), Nequi, Daviplata y pago contra entrega en ciudades seleccionadas.',
  true,
  NOW() - INTERVAL '19 days',
  array_fill(0.031::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Pagos Rechazados o Doble Cobro en Tarjeta',
  'Si tu pago fue debitado pero la orden figura rechazada o duplicada, el sistema bancario libera el saldo retenido automáticamente entre 24 y 72 horas hábiles. Si persiste, solicita el extracto y radícanos una PQRS adjuntando el comprobante.',
  true,
  NOW() - INTERVAL '18 days',
  array_fill(0.029::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Facturación Electrónica y Solicitud de Factura con RUT',
  'Todas las compras generan factura electrónica validada por la DIAN enviada al correo del comprador. Si requieres factura a nombre de persona jurídica o con NIT, debes ingresar los datos tributarios en el checkout o solicitarla antes de 48 horas tras la compra.',
  true,
  NOW() - INTERVAL '17 days',
  array_fill(0.021::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Tiempos Legales de Respuesta de PQRS (Ley 1755)',
  'Cumpliendo con la normativa legal colombiana (Ley 1755 de 2015): Peticiones y consultas: hasta 10 a 15 días hábiles. Quejas y reclamos: máximo 15 días hábiles. Reclamaciones prioritarias de seguridad: 3 a 5 días hábiles.',
  true,
  NOW() - INTERVAL '16 days',
  array_fill(0.027::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Cambios por Talla, Color o Referencia',
  'Dispones de 15 días calendario desde la entrega para solicitar cambio de producto por talla o modelo. El primer cambio es gratuito en fletes si el producto se encuentra en perfecto estado con etiquetas.',
  true,
  NOW() - INTERVAL '15 days',
  array_fill(0.020::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Producto Averiado o Incompleto en el Envío',
  'Si recibes un paquete con sellos rotos, daños físicos o productos faltantes, debes reportarlo en las primeras 24 a 48 horas tras la entrega con fotos del empaque y la guía para hacer efectivo el seguro con la transportadora.',
  true,
  NOW() - INTERVAL '14 days',
  array_fill(0.023::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Horarios y Canales de Atención al Cliente',
  'Atención por chat y asesor humano: Lunes a Viernes de 8:00 AM a 6:00 PM. Sábados de 8:00 AM a 1:00 PM. El widget de auto-atención y radicación formal de PQRS opera 24/7 de manera ininterrumpida.',
  true,
  NOW() - INTERVAL '12 days',
  array_fill(0.017::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Cancelación de Pedidos antes del Despacho',
  'Puedes solicitar la cancelación inmediata de tu compra si aún no ha sido despachada desde bodega. Ingresa a tu cuenta o escríbenos por el chat con tu número de orden para detener el envío y procesar el reembolso del 100%.',
  true,
  NOW() - INTERVAL '10 days',
  array_fill(0.026::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Protección de Datos Personales y Habeas Data',
  'Tus datos están protegidos conforme a la Ley 1581 de 2012 de Protección de Datos Personales. Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos mediante una petición formal en la pestaña Radicar PQRS.',
  true,
  NOW() - INTERVAL '8 days',
  array_fill(0.016::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Soporte Técnico y Guías de Configuración',
  'Ofrecemos soporte técnico para puesta en marcha de equipos y software de 8:00 AM a 5:00 PM. Puedes consultar manuales descargables en PDF y guías paso a paso de instalación desde la sección de recursos.',
  true,
  NOW() - INTERVAL '6 days',
  array_fill(0.014::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Descuentos Corporativos y Compras al por Mayor',
  'Para pedidos institucionales o compras empresariales por volumen superiores a 10 unidades, ofrecemos listas de precios especiales y crédito a 30 días con estudio previo de estados financieros.',
  true,
  NOW() - INTERVAL '5 days',
  array_fill(0.011::float4, ARRAY[1536])::vector
),
(
  gen_random_uuid(),
  '5303da30-d1f9-4a61-922f-fd4319e45037',
  'Reactivación y Recuperación de Contraseña de Cuenta',
  'Si no recuerdas tu contraseña, pulsa "¿Olvidaste tu contraseña?" en el formulario de ingreso. Recibirás un enlace seguro de restablecimiento en tu correo válido por 60 minutos.',
  true,
  NOW() - INTERVAL '3 days',
  array_fill(0.013::float4, ARRAY[1536])::vector
);
