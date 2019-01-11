const User = require('../index')

const getLastMid = async memberType => {
  const lastCreatedMate = await User.findOne({'type': memberType}).sort({'created' : -1})

  return lastCreatedMate.mateId
}

const generateMid = async (memberType, first) => {
  let lastMid
  if(first) {
    switch(memberType) {
      case 'mate':
        return 'A111'
      case 'salon':
        return 'S111'
    }
  }
  else {
    lastMid = await getLastMid(memberType)
  }

  const lastMateLetter = lastMid.substr(0, 1)
  const lastMateNumber = lastMid.substr(1).toString()

  if(memberType === 'salon') {
    return 'S' + (+lastMateNumber + 1)
  }
  else {
    let mateLetter = lastMateLetter

    if (lastMateNumber === '999') {
      mateLetter = getNextLetter(lastMateLetter)
    }

    return mateLetter + getNextNumber(lastMateNumber)
  }
}

function getNextLetter(currentLetter) {
  const letters = 'ABCDEFGHIJKLMNOPQRTUVWXYZ'
  const currentLetterIndex = letters.indexOf(currentLetter)

  return letters[currentLetterIndex + 1]
}

const getNextNumber = (lastNumber) => {
  let newNumber = ''
  
  if (lastNumber === '999') {
    newNumber = '001'
  }
  else {
    newNumber = +lastNumber + 1
    newNumber = str_pad(newNumber.toString(), 3, '0', 'STR_PAD_LEFT')
  }

  return newNumber
}

/* Adding leading zeros to small numbers */
function str_pad(input, pad_length, pad_string, pad_type) {
  let half = '', pad_to_go

  const str_pad_repeater = function(s, len){
    let collect = '', i

    while(collect.length < len) collect += s
    collect = collect.substr(0,len)

    return collect
  }

  if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') { pad_type = 'STR_PAD_RIGHT' }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type === 'STR_PAD_LEFT') { input = str_pad_repeater(pad_string, pad_to_go) + input }
    else if (pad_type === 'STR_PAD_RIGHT') { input = input + str_pad_repeater(pad_string, pad_to_go) }
    else if (pad_type === 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go/2))
      input = half + input + half
      input = input.substr(0, pad_length)
    }
  }

  return input
}

module.exports = generateMid
