DefaultObj = {
    isVerified: false,
    isDeleted: false,
    profile: {
        bio: '',
        image: '',
        experience: [],
        education: [],
        accomplishment: {
            certifications: [],
            awards: [],
            publications: []
        },
        skills: [],
        endorsements: []
    },
    posts: [],
    blocklist: {
        blocked: [],
        blockedBy: [],
    },
    connectionRequests: {
        sent: [],
        receive: []
    },
    connections: [],
    followings: [],
    followingCompany: [],
    followers: [],
}




module.exports = DefaultObj;