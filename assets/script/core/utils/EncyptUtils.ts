export default class EncyptUtils {
    private static _instance : EncyptUtils;

    static get Instance() : EncyptUtils {
        if(this._instance == null) {
            this._instance = new EncyptUtils();
        }

        return this._instance;
    }
    
    private keyString: "v6gNb+S/Dnx5mdGc"; //xxtea密钥 一般16位（也可以不是16位）

    //加密
    xxtea_encrypt(str){
        if ( str == "" ) {
            return "";
        }
        str = this.utf16ToUtf8( str ); //如果是中文解析可能会出问题，加密之前先转化为utf8格式
        var v = this.str2long( str, true );
        var k = this.str2long( this.keyString, false );
        if ( k.length < 4 ) {
            k.length = 4;
        }
        var n = v.length - 1;
        var z = v[ n ],
            y = v[ 0 ],
            delta = 0x9E3779B9;
        var mx, e, p, q = Math.floor( 6 + 52 / ( n + 1 ) ),
            sum = 0;
        while ( 0 < q-- ) {
            sum = sum + delta & 0xffffffff;
            e = sum >>> 2 & 3;
            for ( p = 0; p < n; p++ ) {
                y = v[ p + 1 ];
                mx = ( z >>> 5 ^ y << 2 ) + ( y >>> 3 ^ z << 4 ) ^ ( sum ^ y ) + ( k[ p & 3 ^ e ] ^ z );
                z = v[ p ] = v[ p ] + mx & 0xffffffff;
            }
            y = v[ 0 ];
            mx = ( z >>> 5 ^ y << 2 ) + ( y >>> 3 ^ z << 4 ) ^ ( sum ^ y ) + ( k[ p & 3 ^ e ] ^ z );
            z = v[ n ] = v[ n ] + mx & 0xffffffff;
        }
        str = this.long2str( v, false );
        return this.encode_base64( str ); //加密过后用base64编码
    }

    //解密
    xxtea_decrypt(str) {
        if ( str == "" ) {
            return "";
        }
        str = this.decode_base64( str )
        var v = this.str2long( str, false );
        var k = this.str2long( this.keyString, false );
        if ( k.length < 4 ) {
            k.length = 4;
        }
        var n = v.length - 1;
        var z = v[ n ],
            y = v[ 0 ],
            delta = 0x9E3779B9;
        var mx, e, p, q = Math.floor( 6 + 52 / ( n + 1 ) ),
            sum = q * delta & 0xffffffff;
        while ( sum != 0 ) {
            e = sum >>> 2 & 3;
            for ( p = n; p > 0; p-- ) {
                z = v[ p - 1 ];
                mx = ( z >>> 5 ^ y << 2 ) + ( y >>> 3 ^ z << 4 ) ^ ( sum ^ y ) + ( k[ p & 3 ^ e ] ^ z );
                y = v[ p ] = v[ p ] - mx & 0xffffffff;
            }
            z = v[ n ];
            mx = ( z >>> 5 ^ y << 2 ) + ( y >>> 3 ^ z << 4 ) ^ ( sum ^ y ) + ( k[ p & 3 ^ e ] ^ z );
            y = v[ 0 ] = v[ 0 ] - mx & 0xffffffff;
            sum = sum - delta & 0xffffffff;
        }
        var result = this.long2str( v, true );
        result = this.utf8ToUtf16( result );
        return result;
    }

    utf16ToUtf8( str ) { //utf16转化utf8 解决中文乱码问题 
        var out, i, len, c;
        out = "";
        len = str.length;
        for ( i = 0; i < len; i++ ) {
            c = str.charCodeAt( i );
            if ( ( c >= 0x0001 ) && ( c <= 0x007F ) ) {
                out += str.charAt( i );
            } else if ( c > 0x07FF ) {
                out += String.fromCharCode( 0xE0 | ( ( c >> 12 ) & 0x0F ) );
                out += String.fromCharCode( 0x80 | ( ( c >> 6 ) & 0x3F ) );
                out += String.fromCharCode( 0x80 | ( ( c >> 0 ) & 0x3F ) );
            } else {
                out += String.fromCharCode( 0xC0 | ( ( c >> 6 ) & 0x1F ) );
                out += String.fromCharCode( 0x80 | ( ( c >> 0 ) & 0x3F ) );
            }
        }
        return out;
    }

    utf8ToUtf16( str ) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while ( i < len ) {
            c = str.charCodeAt( i++ );
            switch ( c >> 4 ) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt( i - 1 );
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt( i++ );
                    out += String.fromCharCode( ( ( c & 0x1F ) << 6 ) | ( char2 & 0x3F ) );
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt( i++ );
                    char3 = str.charCodeAt( i++ );
                    out += String.fromCharCode( ( ( c & 0x0F ) << 12 ) |
                        ( ( char2 & 0x3F ) << 6 ) |
                        ( ( char3 & 0x3F ) << 0 ) );
                    break;
            }
        }
        return out;
    }

    long2str( v, w ) { //解密过程中将一个32位 数据转换成4个8位 的数据
        var vl = v.length;
        var n = ( vl - 1 ) << 2;
        if ( w ) {
            var m = v[ vl - 1 ];
            if ( ( m < n - 3 ) || ( m > n ) ) return null;
            n = m;
        }
        for ( var i = 0; i < vl; i++ ) {
            v[ i ] = String.fromCharCode( v[ i ] & 0xff,
                v[ i ] >> 8 & 0xff,
                v[ i ] >> 16 & 0xff,
                v[ i ] >> 24 & 0xff );
        }
        if ( w ) {
            return v.join( '' ).substring( 0, n );
        } else {
            return v.join( '' );
        }
    }

    str2long( s, w ) { //加密过程中将4个8位的数据转化成一个32位的数据
        var len = s.length;
        var v = [];
        for ( var i = 0; i < len; i += 4 ) {
            v[ i >> 2 ] = s.charCodeAt( i ) |
                s.charCodeAt( i + 1 ) << 8 |
                s.charCodeAt( i + 2 ) << 16 |
                s.charCodeAt( i + 3 ) << 24;
        }
        if ( w ) {
            v[ v.length ] = len;
        }
        return v;
    }

    encode_base64( input ) { //base64 编码 
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3 : any = "";
        var enc1, enc2, enc3, enc4 : any = "";
        var i = 0;
        do {
            chr1 = input.charCodeAt( i++ );
            chr2 = input.charCodeAt( i++ );
            chr3 = input.charCodeAt( i++ );

            enc1 = chr1 >> 2;
            enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );
            enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );
            enc4 = chr3 & 63;

            if ( isNaN( chr2 ) ) {
                enc3 = enc4 = 64;
            } else if ( isNaN( chr3 ) ) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt( enc1 ) +
                keyStr.charAt( enc2 ) +
                keyStr.charAt( enc3 ) +
                keyStr.charAt( enc4 );
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while ( i < input.length );

        return output;
    }

    decode_base64( input ) { //base64解码 
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3 : any = "";
        var enc1, enc2, enc3, enc4 : any = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or = 
        var base64test = /[^A-Za-z0-9\+\/\=\n]/g;
        if ( base64test.exec( input ) ) {
            cc.error( "There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding." );
        }
        input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        do {
            enc1 = keyStr.indexOf( input.charAt( i++ ) );
            enc2 = keyStr.indexOf( input.charAt( i++ ) );
            enc3 = keyStr.indexOf( input.charAt( i++ ) );
            enc4 = keyStr.indexOf( input.charAt( i++ ) );

            chr1 = ( enc1 << 2 ) | ( enc2 >> 4 );
            chr2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );
            chr3 = ( ( enc3 & 3 ) << 6 ) | enc4;

            output = output + String.fromCharCode( chr1 );

            if ( enc3 != 64 ) {
                output = output + String.fromCharCode( chr2 );
            }
            if ( enc4 != 64 ) {
                output = output + String.fromCharCode( chr3 );
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while ( i < input.length );

        return output;
    }
}

window.regVar("EncyptUtils", EncyptUtils);
