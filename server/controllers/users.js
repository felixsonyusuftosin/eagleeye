/**
 * @file handles user auth and permissions
 */
const { hashPassword, comparePassword } = require("../utils/password");
const { createToken, verifyToken, getPermissions } = require("../utils/token");
const { createDoc, updateDoc, getDoc, getSomeDoc } = require("../db/crud");
const { groups } = require("../config/table");
/**
 * @function signup
 * @param { UserObject}
 */
let id = "";
let rev = "";
const signup = ({ username, password, firstname, lastname, token, group }) => {
  return new Promise((resolve, reject) => {
    if (!username || !password || !firstname || !lastname || !token || !group) {
      reject({
        reason:
          "Unsupported sign up information please update the information parse",
        code: 400,
        further: "Incomplete parameter"
      });
    }
    getPermissions(token)
      .then(permissionList => {
        const userCreate = "Can create users";
        const index = permissionList.findIndex(user => user === userCreate);
        if (index > -1) {
          let hashed = "";
          username = username.trim().toLowerCase();
          firstname = firstname.trim().toLowerCase();
          lastname = lastname.trim().toLowerCase();
          createdOn = new Date();
          hashPassword(password)
            .then(hashedPassword => {
              hashed = hashedPassword;
              const doc = {
                username,
                firstname,
                lastname,
                password: hashed,
                group,
                createdOn
              };
              getSomeDoc("user", { username }) 
                .then(users => {
                  const exists = () =>
                    new Promise((resolve, reject) => {
                      if (users && users.docs) {
                        resolve(users.docs.length > 0);
                      } else {
                        resolve(false);
                      }
                    });
                  exists().then(value => {
                    if (value) {
                      reject({
                        reason:
                          "Sorry this account already exists on our data base",
                        code: 422,
                        further: "Unprocessible Entity"
                      });
                    } else {
                      createDoc("user", doc)
                        .then(obj => {
                          id = obj.id;
                          rev = obj.rev;
                          const usertoken =
                            createToken({
                              username,
                              password: hashed,
                              id,
                              group
                            }) || "";
                          if (!usertoken)
                            deleteDoc("user", id, rev).then(doc => {
                              reject({
                                reason: "Could not create token for this user",
                                code: 500,
                                further: err
                              });
                            });
                          updateDoc(
                            "user",
                            { ...doc, updatedOn: new Date(), token: usertoken },
                            id,
                            rev
                          )
                            .then(() => {
                              resolve(token);
                            })
                            .catch(err =>
                              reject({
                                reason:
                                  "Could not update the created token for this user",
                                code: 500,
                                furthe: err
                              })
                            );
                        })
                        .catch(err => {
                          reject({
                            reason: "Could not create this user",
                            code: 500,
                            further: err
                          });
                        });
                    }
                  });
                })
                .catch(err => {
                  reject({
                    reason: "Could not get a list of users",
                    code: 500,
                    further: err
                  });
                });
            })
            .catch(err => {
              console.error(err);
              reject({
                reason: "Could not hash this user's password",
                code: 500,
                further: err
              });
            });
        } else {
          reject({
            reason: "you are not authorised to perform this action",
            code: 401,
            further: "Unauthorised"
          });
        }
      })
      .catch(err => {
        reject({
          reason: "Could not get a list of permissions",
          code: 500,
          further: err
        });
      });
  });
};

/**
 * @function signin
 * ### Update requirement not scalable this is pulling all datasets
 * create indecis on the data base to pull by field
 */
const signin = ({ username, password }) => {
  username = username.trim().toLowerCase();
  password = password.trim().toLowerCase();
  return new Promise((resolve, reject) => {
    getSomeDoc("user", { username })
      .then(users => {
        const user = users.docs[0];
        if (user) {
          comparePassword(user.password, password)
            .then(compare => {
              if (compare) {
                const tok = user.token || user.usertoken;
                getPermissions(tok)
                  .then(permissionList => {
                    resolve({
                      token: tok,
                      group: user.group,
                      firstname: user.firstname,
                      lastname: user.lastname,
                      permissions: permissionList
                    });
                  })
                  .catch(err => {
                    console.log(err);
                    reject({
                      reason: "We encountered an error",
                      code: 500,
                      further: err
                    });
                  });
              } else {
                reject({
                  reason: "The password you entered is not correct",
                  code: 404,
                  further: err
                });
              }
            })
            .catch(err => {
              reject({
                reason: "Could not compare password",
                code: 500,
                further: err
              });
            });
        } else {
          reject({
            reason: "User not found, please check our username",
            code: 404,
            further: "Not Found"
          });
        }
      })
      .catch(err => {
        console.log(err, " =====.> here is a simple error of user not found");
        reject({
          reason: "User not found, please check our username",
          code: 404,
          further: "Not Found"
        });
      });
  });
};

/**
 * @function assign to group
 */
const assignGroup = ({ group, username, token }) => {
  return new Promise((resolve, reject) => {
    if (groups.findIndex(groupFind => groupFind === group) < 0) {
      reject({
        reason: "Wrong group passed",
        code: 404,
        further: "Could not find the group info passed"
      });
    } else {
      getPermissions(token).then(permissionList => {
        const userCreate = "Can edit users";
        const index = permissionList.findIndex(user => user === userCreate);
        if (index > -1) {
          getSomeDoc("user", { username }).then(users => {
            console.log(user, " ======> user");
            const user = users.doc[0];
            // users.map(user => {
            //   if (user.doc.username === username) {
            verifyToken(user.token)
              .then(userT => {
                getDoc("user", userT._id).then(item => {
                  item = { ...item, group };
                  updateDoc("user", item, item._id, item._rev)
                    .then(res => resolve(res))
                    .catch(err => {
                      reject({
                        reason: "Could not update the users group",
                        code: 500,
                        further: err
                      });
                    });
                });
              })
              .catch(err => {
                reject({
                  reason: "Wrong token passed",
                  code: 404,
                  further: err
                });
              });
            //   }
            // });
          });
        } else {
          reject({
            reason: "you are not authorised to perform this action",
            code: 401,
            further: "Unauthorised"
          });
        }
      });
    }
  });
};
/**
 * @function verify token and return
 */
const readToken = ({ token }) => {
  return new Promise((resolve, reject) => {
    verifyToken(token)
      .then(item => {
        const { username, group, firstname, lastname } = item;
        getPermissions(token).then(permissionList => {
          resolve({
            username,
            firstname,
            lastname,
            permissionList,
            token
          });
        });
      })
      .catch(err => {
        reject({
          reason: "Sorry could not find the specified token",
          code: 404,
          further: err
        });
      });
  });
};
module.exports = {
  signup,
  signin,
  assignGroup,
  readToken
};
