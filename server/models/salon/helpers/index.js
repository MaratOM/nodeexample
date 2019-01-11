module.exports = {
  setDefaultPass: phone => Math.round(Math.sqrt(Math.pow(phone, 3))).toString().substr(-8),

  millisecondsToMinutes: (base_value, time_fractions = [1000, 60]) => {
    // Input parameters below: base value of 72000 milliseconds, time fractions are
    // 1000 (amount of milliseconds in a second) and 60 (amount of seconds in a minute).
    // console.log(millisecondsToMinutes(72000, [1000, 60]));

    const time_data = [base_value]

    for (i = 0; i < time_fractions.length; i++) {
      time_data.push(parseInt(time_data[i]/time_fractions[i]))
      time_data[i] = time_data[i] % time_fractions[i]
    }

    return time_data.reverse()
  }
}
