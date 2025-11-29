import React, { useState } from 'react';
import { View, Text, Button, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Connect with Local Farmers',
    description: 'Discover fresh produce and livestock directly from producers near you.',
    // icon: require('../assets/onboarding1.png'), // Placeholder for actual image
  },
  {
    id: '2',
    title: 'Sell Your Products Easily',
    description: 'Reach a wider market and manage your sales with our intuitive tools.',
    // icon: require('../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Fast & Reliable Delivery',
    description: 'Get your orders delivered swiftly by our network of delivery agencies.',
    // icon: require('../assets/onboarding3.png'),
  },
];

const OnboardingItem = ({ item }) => (
  <View className="w-full justify-center items-center px-8">
    {/* Placeholder for Icon/Image */}
    <View className="w-48 h-48 bg-gray-200 rounded-full mb-8"></View>
    <Text className="text-3xl font-bold text-center mb-4 text-neutral900">{item.title}</Text>
    <Text className="text-base text-center text-neutral700">{item.description}</Text>
  </View>
);

const OnboardingScreens = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Scroll flatlist to next item
      // this.flatListRef.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.navigate('Auth'); // Navigate to Auth stack after onboarding
    }
  };

  const handleSkip = () => {
    navigation.navigate('Auth'); // Navigate to Auth stack
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={onboardingData}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        // ref={(ref) => (this.flatListRef = ref)}
        onScroll={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
      />

      <View className="flex-row justify-center mb-4">
        {onboardingData.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? 'bg-primaryGreen' : 'bg-neutral300'}`}
          />
        ))}
      </View>

      <View className="p-4">
        {currentIndex < onboardingData.length - 1 ? (
          <Button title="Next" onPress={handleNext} />
        ) : (
          <Button title="Get Started" onPress={handleNext} />
        )}
        <Button title="Skip" onPress={handleSkip} color="#757575" />
      </View>
    </View>
  );
};

export default OnboardingScreens;
