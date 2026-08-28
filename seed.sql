-- Insertar Artículos KB Semilla adicionales si no existen
INSERT INTO "KnowledgeBaseArticles" ("Id", "TenantId", "Title", "Content", "Vector", "IsActive", "CreatedAtUtc")
VALUES 
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'Tiempos de Entrega y Envíos Nacionales', 'Los envíos nacionales tardan entre 2 y 5 días hábiles dependiendo de la ciudad destino.', (SELECT array_agg(0.0)::vector FROM generate_series(1, 1536)), true, NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'Políticas de Garantía y Devolución', 'Dispones de 30 días calendario tras recibir tu producto para solicitar cambio o reembolso directo.', (SELECT array_agg(0.0)::vector FROM generate_series(1, 1536)), true, NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'Métodos de Pago y Facturación Electrónica', 'Aceptamos tarjetas de crédito, débito PSE y transferencias bancarias. Las facturas llegan al correo en 24h.', (SELECT array_agg(0.0)::vector FROM generate_series(1, 1536)), true, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insertar Tickets Históricos (Días anteriores)
INSERT INTO "Tickets" 
  ("Id", "TenantId", "TrackingNumber", "CustomerName", "CustomerEmail", "Subject", "Description", "Type", "Priority", "Sentiment", "Summary", "Status", "CreatedAtUtc")
VALUES
  -- Hace 5 días
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608221015-a1b2', 'Mariana Gómez', 'mariana.gomez@empresa.com', 
   'Consulta sobre factura de compra', 'Requiero la copia de la factura emitida para mi pedido #9842 para efectos tributarios.', 
   'Peticion', 'Low', 'Neutral', 'Cliente solicita copia de factura para trámite tributario.', 'Resolved', NOW() - INTERVAL '5 days 4 hours'),

  -- Hace 4 días
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608231430-c3d4', 'Felipe Restrepo', 'felipe.restrepo@correo.co', 
   'Inconformidad con tiempo de respuesta en soporte', 'Llevo 3 días esperando que me activen el servicio contratado y nadie da respuesta.', 
   'Queja', 'Medium', 'Negative', 'Queja por demora de 3 días en la activación del servicio contratado.', 'Closed', NOW() - INTERVAL '4 days 2 hours'),

  -- Hace 3 días
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608240920-e5f6', 'Lucía Fernández', 'lucia.f@gmail.com', 
   'Sugerencia de modo oscuro en la aplicación', 'Sería excelente que añadieran una opción de tema oscuro para reducir el cansancio visual en las noches.', 
   'Sugerencia', 'Low', 'Positive', 'Sugerencia de usuario para implementar tema oscuro en la interfaz web.', 'Resolved', NOW() - INTERVAL '3 days 6 hours'),

  -- Hace 2 días
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608251645-g7h8', 'Andrés Pastrana', 'andres.p@outlook.com', 
   'Cobro no autorizado en cuenta de ahorros', 'Me aparece un débito automático de renovación que expresamente cancelé hace una semana.', 
   'Reclamo', 'High', 'Negative', 'Reclamo crítico por cobro indebido tras haber cancelado la suscripción.', 'InProgress', NOW() - INTERVAL '2 days 1 hour'),

  -- Ayer
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608261110-i9j0', 'Valentina Ruiz', 'valen.ruiz@tech.org', 
   'Petición de integración API para CRM', 'Necesitamos saber si cuentan con webhooks o API para sincronizar los radicados con HubSpot.', 
   'Peticion', 'Medium', 'Neutral', 'Solicitud técnica sobre disponibilidad de API/Webhooks para CRM.', 'InProgress', NOW() - INTERVAL '1 day 3 hours')
ON CONFLICT DO NOTHING;

-- Insertar Tickets de HOY (Distribuidos a lo largo de las horas)
INSERT INTO "Tickets" 
  ("Id", "TenantId", "TrackingNumber", "CustomerName", "CustomerEmail", "Subject", "Description", "Type", "Priority", "Sentiment", "Summary", "Status", "CreatedAtUtc")
VALUES
  -- Hoy (Mañana)
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608270830-k1l2', 'Camilo Torres', 'camilo.torres@empresa.com', 
   'Error al procesar pago PSE', 'El débito salió de mi banco pero la pasarela arrojó error de timeout y el pedido quedó en espera.', 
   'Reclamo', 'High', 'Negative', 'Reclamo por transacción debitada en banco pero rechazada por timeout en pasarela.', 'Pending', NOW() - INTERVAL '7 hours'),

  -- Hoy (Mediodía)
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608271215-m3n4', 'Diana Morales', 'diana.morales@co.net', 
   'Felicitación y propuesta de mejora para soporte', 'Excelente atención por parte del asesor telefónico. Sugiero añadir chat en vivo directo.', 
   'Sugerencia', 'Low', 'Positive', 'Felicitación por servicio y sugerencia de chat en tiempo real.', 'Pending', NOW() - INTERVAL '4 hours'),

  -- Hoy (Tarde)
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608271540-o5p6', 'Santiago Castro', 'santiago.castro@mail.com', 
   'Solicitud de cambio de dirección de despacho', 'El paquete aún aparece en bodega y requiero actualizar la dirección de entrega.', 
   'Peticion', 'Medium', 'Neutral', 'Petición para modificar la dirección de entrega de un envío en preparación.', 'Pending', NOW() - INTERVAL '1 hour 30 minutes'),

  -- Hoy (Reciente / Crítico)
  (gen_random_uuid(), '5303da30-d1f9-4a61-922f-fd4319e45037', 'PQRS-202608271755-q7r8', 'Estefanía Londoño', 'estefania.l@corp.com', 
   'URGENTE: Bloqueo de cuenta empresarial de producción', 'No podemos acceder al panel de administración y tenemos operaciones detenidas en tienda.', 
   'Reclamo', 'High', 'Negative', 'Reclamo crítico por bloqueo de acceso en cuenta corporativa en producción.', 'Pending', NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;
