import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

export default () => {
    return(
        <Menu inverted stackable>
            <Menu.Item header>
                EtherLearn
            </Menu.Item>

            <Link route="/">
                <a className = "item">
                    Home
                </a>
            </Link>

            <Menu.Menu position ="right">
                <Link route="/questions/lend">
                    <a className = "item">
                        Add Rent Items
                    </a>
                </Link>

                <Link route="/questions/manage">
                    <a className = "item">
                        Manage Items
                    </a>
                </Link>
                
                <Link route="/questions/scancode">
                    <a className = "item">
                        Scan QR Code
                    </a>
                </Link>
            </Menu.Menu>
        </Menu>
    );
};
