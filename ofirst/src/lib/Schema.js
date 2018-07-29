export const schema = {
    title: 'ANON Chat Schema',
    description: 'Database schema for an anonymous chat',
    version: 0,
    type: 'object',
    properties: {
        id: {
            type: 'string',
            primary: true
        },
        message: {
            type: 'string'
        }
    },
    required: ['message']
}