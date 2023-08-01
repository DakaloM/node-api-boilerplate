const mailHtml = (link) => {
    return (
        `
        <!doctype html>
        <html>
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          </head>
          <body style="font-family: sans-serif;">
            <div style="display: block; max-width: 600px;" class="main">
              <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">Password Resert Email</h1>
              <p>We have detected a request to resert your password. If you didnt make the request, please ignore this e=message</p>
              <a style="font-size: 18px; color: "blue"; href="${link}">${link}</a>
            </div>
            <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
            <style>
              .main { background-color: white; }
              a:hover { border-left-width: 1em; min-height: 2em; }
            </style>
          </body>
        </html>
        `
    )
}

module.exports = mailHtml;