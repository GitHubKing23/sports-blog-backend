const bcrypt = require('bcryptjs');

// Replace these values with your actual plain-text password and hashed password
const plainTextPassword = 'ThePasswordYouEnteredDuringRegistration';
const hashedPasswordFromDB = '$2a$10$KR.mcjn0zlIJnts2OnMQU.WYXlfJ91Clyzy31KrLJUPfWwZgDBAsu'; // Replace with actual hash from MongoDB

console.log('[Debug] Verifying password...');
console.log('[Debug] Plain-text password:', plainTextPassword);
console.log('[Debug] Hashed password from DB:', hashedPasswordFromDB);

// Compare the plain-text password with the hashed password
bcrypt.compare(plainTextPassword, hashedPasswordFromDB)
    .then((isMatch) => {
        console.log('[Debug] Password match result:', isMatch);
        if (isMatch) {
            console.log('[Success] The plain-text password matches the hashed password!');
        } else {
            console.log('[Failure] The plain-text password does NOT match the hashed password.');
        }
    })
    .catch((error) => {
        console.error('[Error] An error occurred during password verification:', error);
    });
