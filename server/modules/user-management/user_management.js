const Dao = require('../data-access/data-access')
const Utils = require('./utils')
const DefaultObj = require('./schema');
const dao = new Dao()
const utils = new Utils()


//creating userManagement to export in server.js
class userManagement {

    /**
     * Query the database and gets all the demo by using Dao.find()
     * @author Soumya Nelanti, Sayali
     * @returns {Array} The array of all the documents in the collection   
     */
    constructor() {
        this.USERS = 'users',
            this.FORGET = 'forget-password'
        this.AUTH = 'auth-users'
        this.VERIFY = 'verifications'
    }

    async findAll() {
        let resultFindAll = await dao.find("users");
        return resultFindAll;
    }

    /**
     * Insert the userObj in the User collection
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj An object which is to be inserted in the database
     * @returns {Object} Database Result or Error
     */
    async signupInsert(userObj) {
        let date = new Date(userObj.dateOfBirth);
        userObj.dateOfBirth = date;
        console.log(userObj);
        delete userObj.password;
        console.log(userObj);
        userObj = {
            ...userObj,
            ...DefaultObj
        }
        let result;
        try {
            result = await dao.insert(this.USERS, userObj);
        }
        catch (err) {
            result = { error: err };
        }
        return result;
    }

    /**
     * Insert the email and password in the Auth Collection
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj having userDetails
     * @returns {Object} Database Result or Error
     */
    async authInsert(userObj) {
        let hashPassword = utils.encryptPassword(userObj.password)
        let obj = { email: userObj.email, password: hashPassword };
        let result
        try {
            result = await dao.insert(this.AUTH, obj);
        }
        catch (err) {
            result = { error: err };
        }
        return result;
    }

    /**
     * Insert the verificationCode and userName into the verification collection
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj having userDetails
     * @returns {Object} Database Result or Error
     */
    async verifyInsert(userObj) {
        let code = utils.generateVerificationCode();
        console.log(code)
        let obj = { verificationCode: code, userName: userObj.userName };
        let result;
        try {
            result = await dao.insert(this.VERIFY, obj);
        }
        catch (err) {
            result = { error: err };
        }
        return result;
    }

    /**
     * Verify the user and delete the corresponding document from the 
     * verification collection
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj having userDetails
     * @returns {Object} Database Result or Error
     */
    async deleteVerifiedUser(userObj) {
        let userFind = await dao.find(this.VERIFY, { userName: userObj.userName })
        console.log(userFind.length)
        if (userFind.length == 1) {
            console.log("SDfgSDfsd")
            if (userFind[0].userName == userObj.userName && userFind[0].verificationCode == userObj.verificationCode) {
                console.log("Hello")
                let verifyUpdate = await dao.update(this.USERS, { userName: userObj.userName }, { $set: { isVerified: true } })
                let result = await dao.delete(this.VERIFY, { userName: userObj.userName })
                return verifyUpdate;

            }
        }
        else {
            return {
                error: "Account already verified!!!"
            }
        }
    }
    /**
     * Update the verification code in the verification collection
     * for the User
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj having userDetails
     * @returns {Object} Database Result or Error
     */
    async updateVerifyCode(userObj) {
        let result
        let code = utils.generateVerificationCode();
        try {
            result = await dao.update(this.VERIFY, { userName: userObj.userName }, { $set: { verificatonCode: code } })
        }
        catch (err) {
            result = { err: err }
        }
        return result
    }

    /**
     * Update the verification code in the verification collection
     * for the User
     * @author Soumya Nelanti, Sayali
     * @param {Object} userObj having userDetails
     * @returns {Object} Database Result or Error
     */
    async signin(obj) {
        let log = await dao.find(this.USERS, { userName: obj.userName })
        if (log.length == 1) {
            if (log[0].isDeleted == false) {
                let result = await dao.find(this.AUTH, { email: log[0].email })
                if (result) {
                    let hashPassword = utils.encryptPassword(obj.password)
                    if (result[0].password == hashPassword) {
                        return "Logged In"
                    }
                }
            }
            else {
                return "Account deleted";
            }
        }
        else {
            return "Incorrect Username or Password";
        }
    }

    //forgot password verification link
    async forgotPassword(req) {
        let result = await dao.find(this.USERS, { userName: req.userName })
        console.log(result)
        if (result.length == 1) {
            console.log("abc")
            if (result[0].userName == req.userName) {
                this.email = result[0].email;
                let link = utils.generateVerificationCode();
                let obj = { verificationCode: link, userName: req.userName };
                try {
                    result = await dao.insert(this.FORGET, obj);
                }
                catch (err) {
                    result = { error: err };
                }
                return result;
            }
            else {
                return ("username not found");
            }
        }
    }
    //change password
    async changePassword(verificationCode) {
        let verified = await dao.find(this.FORGET, { verificationCode: verificationCode })
        if (verified.length) {
            let emailObj = await dao.find(this.USERS, { userName: verified[0].userName })
            if (emailObj.length) {
                let hashPassword = utils.encryptPassword(req.password)
                let result = await dao.update(this.AUTH, { email: emailObj[0].email }, { $set: { password: hashPassword } });
                let log = await dao.delete(this.FORGET, { verificationCode: verificationCode })
               return (log);
            }
        }

    }

    /*
    //fetching verification data of user
    async findVerificationData(userObj){
        let userFind=await dao.find('verifications',{userName: userObj.userName})
        console.log(userFind);
        return userFind;
    }

    //unique user Name checking 
   async uniqueUserName(userObj){
       console.log(userObj.userName);
        let userFind=await dao.find('users',{userName: userObj.userName})
        console.log(userFind)
        if(userFind.length==1)
        {
            return "notunique"
        }
        else
        {
            return "unique"
        }
   }

      //unique user email checking 
   async uniqueEmail(userObj){
       console.log(userObj.email);
        let emailFind=await dao.find('users',{email: userObj.email})
        console.log(emailFind)
        if(emailFind.length==1)
        {
            return "notunique"
        }
        else
        {
            return "unique"
        }
   }
   */
}
module.exports = userManagement;
