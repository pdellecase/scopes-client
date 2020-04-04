const dev = {
  STRIPE_KEY: "pk_test_vNerUNffVBYtIjA9KSeuZSX1003paxVHPy",
  s3: {
    REGION: "eu-west-1",
    BUCKET: "scopes-app-2-api-dev-attachmentsbucket-1n9ij54w5aqq9"
  },
  apiGateway: {
    REGION: "eu-west-1",
    URL: "https://nf9dsoawga.execute-api.eu-west-1.amazonaws.com/dev"
  },
  cognito: {
    REGION: "eu-west-1",
    USER_POOL_ID: "eu-west-1_k5V2bqJ4X",
    APP_CLIENT_ID: "1j090aip480d4bok0s8i67gvvg",
    IDENTITY_POOL_ID: "eu-west-1:b384c630-97f8-4c95-9a0d-a6ccf21e03c1"
  }
};

const prod = {
  STRIPE_KEY: "pk_test_vNerUNffVBYtIjA9KSeuZSX1003paxVHPy",
  s3: {
    REGION: "eu-west-1",
    BUCKET: "scopes-app-2-api-prod-attachmentsbucket-aikv45stjsw7"
  },
  apiGateway: {
    REGION: "eu-west-1",
    URL: "https://xpfcicuwp0.execute-api.eu-west-1.amazonaws.com/prod"
  },
  cognito: {
    REGION: "eu-west-1",
    USER_POOL_ID: "eu-west-1_g97BD6WL5",
    APP_CLIENT_ID: "1c96196c3amltvevm344f5fqoc",
    IDENTITY_POOL_ID: "eu-west-1:41d368f9-91b8-455e-867b-035e1cd0a0be"
  }
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'prod'
  ? prod
  : dev;

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 5000000,
  ...config
};