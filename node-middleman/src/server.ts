import app from './app';

const port = process.env.PORT || 2224;
const debug = process.env.DEBUG || false;

app.listen(port, () => {
    if (debug) {
        console.log(`Server is running on http://localhost:${port}`);
    }
    else {
        console.log(`Server is running on port ${port}`);
    }
});

