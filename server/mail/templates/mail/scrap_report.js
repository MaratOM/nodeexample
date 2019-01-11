module.exports = (name, surname, email, data) => {
  const body =
        `<h2>Scrap Report</h2>
        <p>Заскраплена страница ${data.scrapPage} (добавлено ${data.salonsAdded} салонов) за ${data.time}<br/>начало - окончание скрапа<br/>${data.startTime}<br/>${data.endTime}</p>
        <p>До скрапа в базе было ${data.dbSalonsOnStart} салонов<br/>после скрапа ${data.dbSalonsOnEnd} салонов<br/>добавлено ${data.salonsAdded} салонов<br/>Среднее время на салон ${data.averageTime}</p>
        <p>Scrap used ${data.scrapSpace} bites<br/>Free space ${data.freeSpace} bites</p>`

  return {
    "html" : body,
    "text" : 'Scrap Report',
    "subject" : 'Scrap Report',
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
