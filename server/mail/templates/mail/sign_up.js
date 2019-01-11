module.exports = (name, surname, email, data) => {
  const body =
        `<h2>Здравствуйте, ${name}!</h2>
        <p>Спасибо за регистрацию в сервисе Подружки.Онлайн!</p>
        <p>Для подтверждения вашего email адреса, пожалуйста, перейдите по ссылке ниже.</p>
        <p><a href=${data.link}>Подтвердить адрес</a></p>`

  return {
    "html" : body,
    "text" : `Для подтверждения вашего email адреса, пожалуйста, перейдите по ссылке ${data.link}`,
    "subject" : `${name}, подтвердите свой аккаунт в сервисе Подружки.Онлайн!`,
    "template": {
      "id": 808218,
      "variables": {
        "company": "ПОДРУЖКИ.ОНЛАЙН",
        "company_address": "info@podruzhki.online",
        "name": name,
        "link": data.link,
      }
    },
    "from" : {
    "name" : "Подружки.Онлайн",
      "email" : "po@podruzhki.online"
    },
      "to" : [
      {
        "name" : `${name} ${surname}`,
        "email" : email,
      },
    ],
  }
}
