const getNumber = async () => {
    const number = await ethers.provider.getStorageAt("0x73bBcaDA82Fe1c9D1DD13d38eb1A847Fc2d90498", 0)
    console.log(parseInt(number, 16))
}

getNumber()
