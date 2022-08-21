require('dotenv').config();
const { request } = require('graphql-request')
const cron = require('node-cron');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const endpoint = 'http://localhost:3001/graphql';
let counter = 0;


const getWatchList = async () => {
    const query = `query Query {
        getWatchlist
      }`;

    return await request(endpoint, query)
}


// Run GraphQL queries/mutations using a static function
// let task = cron.schedule('*/1 * * * *', async () => {
let task = async () => {
    console.log('Checking for tee times: ', counter);
    counter += 1;

    const watchList = await getWatchList()


    const query = `query CheckAvailability($id: ID!) {
        checkAvailability(_id: $id) {
            user {
            _id
            first_name
            last_name
            phone_number
            email
            }
            teetimes
        }
    }`;



    watchList.getWatchlist.forEach(async (time) => {

        const variables = {
            "id": time
        }

        const result = await request(endpoint, query, variables)


        console.log('results : ', result)

        let phoneNum = result.checkAvailability.user.phone_number;

        if (result.checkAvailability.teetimes.length > 0) {
            client.messages
                .create({
                    body:
                        `${result.checkAvailability.teetimes.join()}`,
                    from: '+19808426566',
                    to: `+1${phoneNum}`
                })
        }

    })

};
// });

task();
// task.start();

