import jwt from 'jsonwebtoken';


const generateAccessToken = async (userId) => {
    try {
        const token = await jwt.sign(
            { id: userId },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: "5h" }
        )

        

        return token;   

    } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
    }

}

export default generateAccessToken;