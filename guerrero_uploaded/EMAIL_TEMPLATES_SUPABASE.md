# 📧 PLANTILLAS DE EMAIL PARA SUPABASE - GUERRERO ACADEMY

Copia estos templates en tu dashboard de Supabase:
**Authentication → Email Templates**

---

## 1. CONFIRM SIGNUP (Confirmar Registro)

**Subject:** ⚽ Confirma tu cuenta en Guerrero Academy

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header con Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); padding: 30px; text-align: center;">
              <img src="https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg" alt="Guerrero Academy" width="60" height="60" style="margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Guerrero Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Academia de Fútbol</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">¡Bienvenido a la familia!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Gracias por registrarte en Guerrero Academy. Para completar tu registro y acceder a tu cuenta, confirma tu dirección de email haciendo clic en el botón:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(216, 112, 147, 0.4);">
                      ✓ Confirmar mi Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no creaste esta cuenta, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 Guerrero Academy. Todos los derechos reservados.<br>
                <a href="https://wa.me/18296396001" style="color: #D87093; text-decoration: none;">WhatsApp: +1 829-639-6001</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. INVITE USER (Invitar Usuario)

**Subject:** ⚽ Has sido invitado a Guerrero Academy

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header con Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); padding: 30px; text-align: center;">
              <img src="https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg" alt="Guerrero Academy" width="60" height="60" style="margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Guerrero Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Academia de Fútbol</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">¡Te han invitado!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Has sido invitado a formar parte de Guerrero Academy. Haz clic en el siguiente botón para crear tu contraseña y acceder al sistema:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(216, 112, 147, 0.4);">
                      🔐 Crear mi Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Este enlace expira en 24 horas. Si no solicitaste esta invitación, ignora este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 Guerrero Academy. Todos los derechos reservados.<br>
                <a href="https://wa.me/18296396001" style="color: #D87093; text-decoration: none;">WhatsApp: +1 829-639-6001</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. MAGIC LINK (Enlace Mágico)

**Subject:** 🔑 Tu enlace de acceso a Guerrero Academy

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header con Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); padding: 30px; text-align: center;">
              <img src="https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg" alt="Guerrero Academy" width="60" height="60" style="margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Guerrero Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Academia de Fútbol</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Tu enlace de acceso</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Haz clic en el siguiente botón para acceder a tu cuenta de Guerrero Academy sin necesidad de contraseña:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(216, 112, 147, 0.4);">
                      🚀 Acceder a mi Cuenta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Este enlace es válido por 1 hora y solo puede usarse una vez.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 Guerrero Academy. Todos los derechos reservados.<br>
                <a href="https://wa.me/18296396001" style="color: #D87093; text-decoration: none;">WhatsApp: +1 829-639-6001</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. RESET PASSWORD (Recuperar Contraseña)

**Subject:** 🔐 Recupera tu contraseña de Guerrero Academy

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header con Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); padding: 30px; text-align: center;">
              <img src="https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg" alt="Guerrero Academy" width="60" height="60" style="margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Guerrero Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Academia de Fútbol</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Recuperar Contraseña</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva contraseña:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(216, 112, 147, 0.4);">
                      🔑 Crear Nueva Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual seguirá siendo válida.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 Guerrero Academy. Todos los derechos reservados.<br>
                <a href="https://wa.me/18296396001" style="color: #D87093; text-decoration: none;">WhatsApp: +1 829-639-6001</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. CHANGE EMAIL (Cambiar Email)

**Subject:** 📧 Confirma tu nuevo email en Guerrero Academy

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header con Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); padding: 30px; text-align: center;">
              <img src="https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg" alt="Guerrero Academy" width="60" height="60" style="margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Guerrero Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Academia de Fútbol</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Confirmar Nuevo Email</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Has solicitado cambiar tu dirección de email. Por favor confirma este cambio haciendo clic en el siguiente botón:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #F188B7 0%, #D87093 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(216, 112, 147, 0.4);">
                      ✓ Confirmar Nuevo Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este cambio, contacta a soporte inmediatamente.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 Guerrero Academy. Todos los derechos reservados.<br>
                <a href="https://wa.me/18296396001" style="color: #D87093; text-decoration: none;">WhatsApp: +1 829-639-6001</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 INSTRUCCIONES PARA CONFIGURAR EN SUPABASE

1. Ve a **https://supabase.com/dashboard**
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** → **Email Templates**
4. Para cada tipo de email:
   - Copia el **Subject** (Asunto)
   - Copia el código **HTML** completo (todo lo que está entre los ```)
   - Pega en el editor correspondiente
5. Haz clic en **Save** después de cada cambio

**URL DEL LOGO:**
```
https://guerreroacademy.vercel.app/guerrero_uploaded/logo-guerrero.svg
```

**NOTA:** Asegúrate de mantener las variables como `{{ .ConfirmationURL }}` exactamente como están, ya que Supabase las reemplaza automáticamente con los enlaces correctos.
