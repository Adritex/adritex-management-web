import * as routerDom from "react-router-dom";

export function Routes() {
    return (
        <routerDom.BrowserRouter>
            <routerDom.Routes>
                <routerDom.Route path="/" />
            </routerDom.Routes>
        </routerDom.BrowserRouter>
    );
}