module.exports = (name, surname, email, data) => {
  let userData = ''
  for(let key in data) {
    if (data.hasOwnProperty(key)) {
      userData += `<span>${key}: ${JSON.stringify(data[key])}</span><br/>>`
    }
  }
  const body =
        `<h2>Здравствуйте, ${surname}!</h2>
        <p>В сервисе Подружки.Онлайн зарегистрировался новый пользователь!</p>
        <p>Его данные:</p>
        <div>${userData}</div>`

  return {
    "html" : body,
    "text" : `Добавлен новый пользователь ${JSON.stringify(data)}`,
    "subject" : `Подружки.Онлайн. Добавлен новый пользователь!`,
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
