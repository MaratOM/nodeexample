module.exports = (name, surname, email, data) => {
  let userData = ''
  for(let key in data) {
    if (data.hasOwnProperty(key)) {
      userData += `<span>${key}: ${JSON.stringify(data[key])}</span><br/>`
    }
  }
  const body =
        `<h2>Здравствуйте, ${surname}!</h2>
        <p>Владелец салона из базы впервые вошёл в сервис!</p>
        <p>Его данные:</p>
        <div>${userData}</div>`

  return {
    "html" : body,
    "text" : `Владелец салона из базы впервые вошёл в сервис ${JSON.stringify(data)}`,
    "subject" : `Подружки.Онлайн. Владелец салона из базы впервые вошёл в сервис!`,
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
