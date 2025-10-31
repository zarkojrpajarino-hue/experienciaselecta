# Configuración de Dominio y Correos - experienciaselecta.com

## ✅ Estado Actual

### Dominio Principal
- **Dominio**: experienciaselecta.com
- **Estado**: Activo en Lovable
- **SSL**: Automático por Lovable

### Configuración de Correos (Resend)

#### 1. Verificación del Dominio en Resend
Para que los correos funcionen correctamente desde `noreply@experienciaselecta.com`, necesitas:

1. **Ir a Resend Dashboard**: https://resend.com/domains
2. **Añadir el dominio**: experienciaselecta.com
3. **Configurar los registros DNS** que Resend te proporcionará:
   - **SPF Record** (TXT): Para autenticación
   - **DKIM Records** (TXT): Para firma digital
   - **MX Records**: Para recepción (opcional)

#### Ejemplo de registros DNS típicos de Resend:
```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:amazonses.com ~all

Tipo: TXT  
Nombre: resend._domainkey
Valor: [clave DKIM proporcionada por Resend]

Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:selectaexperiencia@gmail.com
```

**IMPORTANTE**: Los valores exactos te los proporciona Resend al añadir el dominio.

#### 2. Verificación del Estado
Una vez configurados los registros DNS:
- Espera 24-48 horas para propagación DNS
- Verifica el estado en Resend Dashboard
- El dominio debe aparecer como "Verified" ✅

### Edge Functions Configuradas

Todas las funciones de correo están configuradas para usar `noreply@experienciaselecta.com`:

1. ✅ **send-contact-email**: Formulario de contacto
2. ✅ **send-welcome-email**: Email de bienvenida
3. ✅ **send-marketing-email**: Emails de marketing
4. ✅ **send-scheduled-marketing-emails**: Emails programados
5. ✅ **send-review-to-admin**: Notificaciones de valoraciones
6. ✅ **process-gift-shipping**: Notificaciones de regalos
7. ✅ **resend-gift-reminders**: Recordatorios de regalos

### Destinatarios Admin
Todos los correos administrativos se envían a: `selectaexperiencia@gmail.com`

## 🧪 Pruebas a Realizar

### 1. Prueba de Formulario de Contacto
1. Ir a la web experienciaselecta.com
2. Navegar a la sección FAQ
3. Completar el formulario de contacto
4. Verificar que:
   - ✅ Recibes confirmación en pantalla
   - ✅ Llega email a selectaexperiencia@gmail.com
   - ✅ El usuario recibe email de confirmación

### 2. Prueba de Registro de Usuario
1. Crear una cuenta nueva
2. Verificar que llega el email de bienvenida
3. Comprobar formato y contenido

### 3. Prueba de Compra/Regalo
1. Realizar una compra de prueba
2. Verificar emails de confirmación
3. Si es regalo, verificar emails a destinatario

### 4. Prueba de Marketing (si está habilitado)
1. Dar consentimiento de cookies con email de marketing
2. Esperar el envío programado
3. Verificar recepción

## ⚠️ Antes de Usar en Producción

### Checklist Resend:
- [ ] Dominio experienciaselecta.com añadido en Resend
- [ ] Registros DNS (SPF, DKIM, DMARC) configurados
- [ ] Dominio verificado en Resend (estado: Verified)
- [ ] API Key de Resend configurada en Supabase (secreto RESEND_API_KEY)
- [ ] Cuenta de Resend actualizada a plan adecuado (si necesitas enviar >100 emails/día)

### Checklist Supabase:
- [ ] Secret RESEND_API_KEY configurado
- [ ] Edge Functions desplegadas correctamente
- [ ] Site URL configurada: https://experienciaselecta.com
- [ ] Redirect URLs configuradas para auth

### Checklist DNS:
- [ ] Registro A apuntando a Lovable (185.158.133.1)
- [ ] Registros de email de Resend configurados
- [ ] DNS propagado (verificar con https://dnschecker.org)

## 🔍 Troubleshooting

### Los correos no se envían
1. Verificar que el dominio está verificado en Resend
2. Comprobar que RESEND_API_KEY está configurado en Supabase
3. Ver logs de Edge Functions en Supabase
4. Verificar que los registros DNS están correctos

### Los correos van a spam
1. Asegurarse de que SPF, DKIM y DMARC están configurados
2. Verificar que el dominio está "warm up" (enviar emails gradualmente)
3. Evitar palabras spam en asuntos y contenidos
4. Pedir a destinatarios que marquen como "no spam"

### Errores en Edge Functions
1. Revisar logs en Supabase Dashboard
2. Verificar que todos los secretos están configurados
3. Comprobar formato de los datos enviados

## 📊 Monitoreo

### En Resend Dashboard puedes ver:
- Emails enviados/fallidos
- Tasa de apertura
- Rebotes (bounces)
- Quejas de spam

### En Supabase puedes ver:
- Logs de Edge Functions
- Errores de ejecución
- Tiempos de respuesta

## 🎯 Próximos Pasos

1. **Configurar dominio en Resend** (más urgente)
2. **Verificar registros DNS**
3. **Realizar pruebas de cada funcionalidad**
4. **Monitorear los primeros envíos**
5. **Ajustar contenidos según necesidad**

---

**Última actualización**: 28 de octubre de 2025
**Dominio**: experienciaselecta.com (Activo)
**Email**: noreply@experienciaselecta.com
**Admin**: selectaexperiencia@gmail.com
