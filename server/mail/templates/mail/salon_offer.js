module.exports = (name, email, data) => {
  const templdateIds = {
    fromDb: 812638,
    notFromDb: 848337,
  }
  const from = data.from ? `(${data.from}) ` : ''
  const body =
        `<h2>Здравствуйте!</h2>
        <p>Присоединяйтесь к сервису Подружки.Онлайн!</p>`

  return {
    "html" : body,
    "text" : `Здравствуйте! Присоединяйтесь к сервису Подружки.Онлайн!`,
    "subject" : `${from}Сервис для увеличения оборота салона красоты и не только!`,
    "template": {
      "id": templdateIds[data.template],
      "variables": {
        "company": "ПОДРУЖКИ.ОНЛАЙН",
        "company_address": "info@podruzhki.online",
      }
    },
    "from" : {
    "name" : "Подружки.Онлайн",
      "email" : "po@podruzhki.online"
    },
      "to" : [
      {
        "name" : `${name}`,
        "email" : email,
      },
    ],
  }
}
