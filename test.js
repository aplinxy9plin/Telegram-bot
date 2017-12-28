function retnum(str) { 
    var num = str.replace(/[^0-9]/g, '')
    return num
}
//console.log(retnum('Американо 110₽'))