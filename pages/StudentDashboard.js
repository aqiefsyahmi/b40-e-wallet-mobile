import { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import moment from "moment";

import instanceAxios from "../lib/instanceAxios";
import { useUserContext } from "../hooks";
import { getValueFor, deleteItem } from "../utils/SecureStore";

import {
  Button,
  Profile,
  Amount,
  TransactionContainer,
  TransactionItem,
  Refresh,
} from "../components";

import { globals, dashboardStyle } from "../styles";

const StudentDashboard = ({ navigation }) => {
  const { user, setUser } = useUserContext();
  const [userData, setUserData] = useState({
    student_name: "",
    matric_no: "",
    wallet_amount: 0,
  });
  const [transactionData, setTransactionData] = useState([]);

  const fetchUser = (id, token) => {
    instanceAxios
      .get(`/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setUserData(res.data[0]))
      .catch(err => console.error(err));

    instanceAxios
      .get(`/api/transactions/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setTransactionData(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getValueFor("accessToken").then(res => fetchUser(user.id, res));
  }, [user.refresh]);

  return (
    <View style={[globals.container, { paddingTop: 48 }]}>
      <Refresh>
        <View style={dashboardStyle.logoutContainer}>
          {userData && (
            <Profile
              textField1={userData.student_name}
              textField2={userData.matric_no}
            />
          )}
          <TouchableOpacity
            onPress={async () => {
              await deleteItem("accessToken");
              await deleteItem("refreshToken");
              setUser(prev => ({
                ...prev,
                id: undefined,
                login: false,
                student: false,
              }));
            }}
          >
            <Image
              style={dashboardStyle.logoutIcon}
              source={require("../assets/icons/logout-icon.png")}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 24 }}>
          {userData && (
            <Amount amount={parseInt(userData.wallet_amount)} student={true} />
          )}
        </View>
        <View style={{ marginTop: 20 }}>
          <Button label={"Pay"} onPress={() => navigation.navigate("Pay")} />
        </View>
        <View style={{ marginTop: 40, paddingBottom: 24 }}>
          <View style={[dashboardStyle.transactionHeaderWrap]}>
            <Text style={dashboardStyle.transactionHeader}>
              Recent transaction
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
            >
              <Image
                style={{ width: 25, height: 25 }}
                source={require("../assets/icons/more-icon.png")}
              />
            </TouchableOpacity>
          </View>
          <TransactionContainer>
            {transactionData &&
              transactionData.slice(0, 3).map(({ sender, amount, created_at, transaction_id, cafe_name, student_name }, i) => {
                let details = {
                  sender: `${student_name} (${sender})`,
                  recipient: cafe_name,
                  transactionId: transaction_id,
                  amount: `RM${amount}`,
                  date: `${moment(created_at).format("D-MM-YYYY")} at ${moment(created_at).format("h.mma")}`
                }

                return (
                  <TransactionItem
                    key={i}
                    field1={sender}
                    time={moment(created_at).format("h.mma")}
                    date={moment(created_at).format("D-MM")}
                    amount={amount}
                    noBorder={i == 0 && true}
                    navigate={() => navigation.navigate("Transaction Details", { data: details })}
                  />
                );
              })}
          </TransactionContainer>
        </View>
      </Refresh>
    </View>
  );
};

export default StudentDashboard;
